import { db } from "../_lib/db.js";
import { json, error, cors, allow, readJson } from "../_lib/http.js";
import { requireAdmin } from "../_lib/auth.js";

const mapPromo = (r) => ({
  id: r.id, title: r.title, description: r.description, badge: r.badge,
  dayOfWeek: r.day_of_week, imageUrl: r.image_url, isActive: r.is_active,
  sortOrder: r.sort_order,
});
const mapEvent = (r) => ({
  id: r.id, title: r.title, subtitle: r.subtitle, description: r.description,
  imageUrl: r.image_url, eventDate: r.event_date ? String(r.event_date).slice(0, 10) : null,
  eventTime: r.event_time,
  badge: r.badge, ctaLabel: r.cta_label, isPublished: r.is_published, sortOrder: r.sort_order,
});
const mapGallery = (r) => ({
  id: r.id, url: r.url, caption: r.caption, isPublished: r.is_published, sortOrder: r.sort_order,
});
const mapHours = (x) => ({
  dayOfWeek: x.day_of_week, label: x.label, lunchOpen: x.lunch_open,
  lunchClose: x.lunch_close, dinnerOpen: x.dinner_open,
  dinnerClose: x.dinner_close, isClosed: x.is_closed,
});

const RESOURCES = new Set(["promos", "events", "gallery", "closed-dates", "settings", "hours"]);

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;
  if (allow(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;

  const resource = String(req.query.resource || "");
  if (!RESOURCES.has(resource)) return error(req, res, 400, "Risorsa non valida.");

  try {
    const sql = db();

    if (req.method === "GET") {
      if (resource === "settings") {
        const rows = await sql`select key, value from site_settings`;
        return json(req, res, 200, { settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
      }
      if (resource === "hours") {
        const rows = await sql`select * from opening_hours order by day_of_week`;
        return json(req, res, 200, { hours: rows.map(mapHours) });
      }
      if (resource === "promos") {
        const rows = await sql`select * from promos order by sort_order, created_at`;
        return json(req, res, 200, { promos: rows.map(mapPromo) });
      }
      if (resource === "events") {
        const rows = await sql`select * from events order by sort_order, created_at`;
        return json(req, res, 200, { events: rows.map(mapEvent) });
      }
      if (resource === "gallery") {
        const rows = await sql`select * from gallery_images order by sort_order, created_at`;
        return json(req, res, 200, { gallery: rows.map(mapGallery) });
      }
      const rows = await sql`select date::text as date, reason from closed_dates order by date`;
      return json(req, res, 200, { "closed-dates": rows });
    }

    let body;
    try {
      body = await readJson(req);
    } catch {
      return error(req, res, 400, "Richiesta non valida.");
    }

    if (req.method === "POST") {
      if (resource === "settings") {
        const entries = Object.entries(body.settings || body).filter(([key]) => /^[a-z_]+$/.test(key));
        if (!entries.length) return error(req, res, 422, "Nessuna impostazione da salvare.");
        for (const [key, value] of entries) {
          await sql`
            insert into site_settings (key, value, updated_at)
            values (${key}, ${JSON.stringify(value)}::jsonb, now())
            on conflict (key) do update set value = excluded.value, updated_at = now()
          `;
        }
        const rows = await sql`select key, value from site_settings`;
        return json(req, res, 200, { settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
      }

      if (resource === "hours") {
        const list = Array.isArray(body.hours) ? body.hours : [];
        for (const h of list) {
          await sql`
            update opening_hours set
              lunch_open = ${h.lunchOpen || null}, lunch_close = ${h.lunchClose || null},
              dinner_open = ${h.dinnerOpen || null}, dinner_close = ${h.dinnerClose || null},
              is_closed = ${Boolean(h.isClosed)}
            where day_of_week = ${Number(h.dayOfWeek)}
          `;
        }
        const rows = await sql`select * from opening_hours order by day_of_week`;
        return json(req, res, 200, { hours: rows.map(mapHours) });
      }

      if (resource === "promos") {
        const rows = await sql`
          insert into promos (title, description, badge, day_of_week, image_url, is_active, sort_order)
          values (${String(body.title || "Nuova promo")}, ${String(body.description || "")},
                  ${String(body.badge || "")},
                  ${body.dayOfWeek === undefined || body.dayOfWeek === null || body.dayOfWeek === "" ? null : Number(body.dayOfWeek)},
                  ${String(body.imageUrl || "")}, ${body.isActive !== false}, ${Number(body.sortOrder) || 0})
          returning *
        `;
        return json(req, res, 201, { promos: mapPromo(rows[0]) });
      }

      if (resource === "events") {
        const rows = await sql`
          insert into events (title, subtitle, description, image_url, event_date, event_time, badge, cta_label, is_published, sort_order)
          values (${String(body.title || "Nuovo evento")}, ${String(body.subtitle || "")},
                  ${String(body.description || "")}, ${String(body.imageUrl || "")},
                  ${body.eventDate || null}, ${String(body.eventTime || "")}, ${String(body.badge || "")},
                  ${String(body.ctaLabel || "Prenota")}, ${body.isPublished !== false}, ${Number(body.sortOrder) || 0})
          returning *
        `;
        return json(req, res, 201, { events: mapEvent(rows[0]) });
      }

      if (resource === "gallery") {
        const rows = await sql`
          insert into gallery_images (url, caption, is_published, sort_order)
          values (${String(body.url || "")}, ${String(body.caption || "")},
                  ${body.isPublished !== false}, ${Number(body.sortOrder) || 0})
          returning *
        `;
        return json(req, res, 201, { gallery: mapGallery(rows[0]) });
      }

      const rows = await sql`
        insert into closed_dates (date, reason) values (${String(body.date)}, ${String(body.reason || "")})
        on conflict (date) do update set reason = excluded.reason
        returning date::text as date, reason
      `;
      return json(req, res, 201, { "closed-dates": rows[0] });
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id || body.id || "");
      if (!id) return error(req, res, 400, "ID mancante.");

      if (resource === "closed-dates") {
        await sql`delete from closed_dates where date = ${id}::date`;
        return json(req, res, 200, { ok: true });
      }
      if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID non valido.");

      if (resource === "promos") await sql`delete from promos where id = ${id}::uuid`;
      else if (resource === "events") await sql`delete from events where id = ${id}::uuid`;
      else await sql`delete from gallery_images where id = ${id}::uuid`;
      return json(req, res, 200, { ok: true });
    }

    // PATCH
    const id = String(req.query.id || body.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID non valido.");

    if (resource === "promos") {
      const rows = await sql`
        update promos set
          title = coalesce(${body.title ?? null}, title),
          description = coalesce(${body.description ?? null}, description),
          badge = coalesce(${body.badge ?? null}, badge),
          day_of_week = coalesce(${body.dayOfWeek === undefined || body.dayOfWeek === "" ? null : Number(body.dayOfWeek)}, day_of_week),
          image_url = coalesce(${body.imageUrl ?? null}, image_url),
          is_active = coalesce(${body.isActive === undefined ? null : Boolean(body.isActive)}, is_active),
          sort_order = coalesce(${body.sortOrder === undefined ? null : Number(body.sortOrder)}, sort_order),
          updated_at = now()
        where id = ${id}::uuid returning *
      `;
      if (!rows.length) return error(req, res, 404, "Promo non trovata.");
      return json(req, res, 200, { promos: mapPromo(rows[0]) });
    }

    if (resource === "events") {
      const rows = await sql`
        update events set
          title = coalesce(${body.title ?? null}, title),
          subtitle = coalesce(${body.subtitle ?? null}, subtitle),
          description = coalesce(${body.description ?? null}, description),
          image_url = coalesce(${body.imageUrl ?? null}, image_url),
          event_date = coalesce(${body.eventDate || null}, event_date),
          event_time = coalesce(${body.eventTime ?? null}, event_time),
          badge = coalesce(${body.badge ?? null}, badge),
          cta_label = coalesce(${body.ctaLabel ?? null}, cta_label),
          is_published = coalesce(${body.isPublished === undefined ? null : Boolean(body.isPublished)}, is_published),
          sort_order = coalesce(${body.sortOrder === undefined ? null : Number(body.sortOrder)}, sort_order),
          updated_at = now()
        where id = ${id}::uuid returning *
      `;
      if (!rows.length) return error(req, res, 404, "Evento non trovato.");
      return json(req, res, 200, { events: mapEvent(rows[0]) });
    }

    const rows = await sql`
      update gallery_images set
        url = coalesce(${body.url ?? null}, url),
        caption = coalesce(${body.caption ?? null}, caption),
        is_published = coalesce(${body.isPublished === undefined ? null : Boolean(body.isPublished)}, is_published),
        sort_order = coalesce(${body.sortOrder === undefined ? null : Number(body.sortOrder)}, sort_order)
      where id = ${id}::uuid returning *
    `;
    if (!rows.length) return error(req, res, 404, "Immagine non trovata.");
    return json(req, res, 200, { gallery: mapGallery(rows[0]) });
  } catch (err) {
    console.error("admin content error", err);
    return error(req, res, 500, "Errore nel salvataggio dei contenuti.");
  }
}
