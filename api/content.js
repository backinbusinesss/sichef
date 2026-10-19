import { db, mapItem } from "./_lib/db.js";
import { json, error, cors, allow } from "./_lib/http.js";

/**
 * Contenuto pubblico del sito in una sola chiamata:
 * menu, categorie, allergeni, promo, eventi, galleria, orari, impostazioni.
 * Così la home carica in un round-trip e resta velocissima.
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (allow(req, res, ["GET"])) return;

  try {
    const sql = db();
    const [categories, items, allergens, links, promos, events, gallery, hours, settings, closed] =
      await Promise.all([
        sql`select * from categories where is_active = true order by sort_order, name`,
        sql`select * from menu_items order by sort_order, name`,
        sql`select * from allergens order by sort_order`,
        sql`select item_id, allergen_code from menu_item_allergens`,
        sql`select * from promos where is_active = true order by sort_order, created_at`,
        sql`select * from events where is_published = true order by sort_order, event_date nulls last`,
        sql`select * from gallery_images where is_published = true order by sort_order, created_at`,
        sql`select * from opening_hours order by day_of_week`,
        sql`select key, value from site_settings`,
        sql`select date::text as date, reason from closed_dates where date >= current_date order by date`,
      ]);

    const byItem = new Map();
    for (const link of links) {
      if (!byItem.has(link.item_id)) byItem.set(link.item_id, []);
      byItem.get(link.item_id).push(link.allergen_code);
    }

    return json(req, res, 200, {
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        kind: c.kind,
        emoji: c.emoji,
        sortOrder: c.sort_order,
      })),
      items: items.map((row) =>
        mapItem({ ...row, allergens: byItem.get(row.id) ?? [] }),
      ),
      allergens: allergens.map((a) => ({
        code: a.code,
        name: a.name,
        shortName: a.short_name,
        emoji: a.emoji,
        description: a.description,
      })),
      promos: promos.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        badge: p.badge,
        dayOfWeek: p.day_of_week,
        imageUrl: p.image_url,
      })),
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
        description: e.description,
        imageUrl: e.image_url,
        eventDate: e.event_date ? String(e.event_date).slice(0, 10) : null,
        eventTime: e.event_time,
        badge: e.badge,
        ctaLabel: e.cta_label,
      })),
      gallery: gallery.map((g) => ({
        id: g.id,
        url: g.url,
        caption: g.caption,
      })),
      hours: hours.map((h) => ({
        dayOfWeek: h.day_of_week,
        label: h.label,
        lunchOpen: h.lunch_open,
        lunchClose: h.lunch_close,
        dinnerOpen: h.dinner_open,
        dinnerClose: h.dinner_close,
        isClosed: h.is_closed,
      })),
      settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
      closedDates: closed,
    });
  } catch (err) {
    console.error("content error", err);
    return error(req, res, 500, "Impossibile caricare i contenuti. Riprova tra poco.");
  }
}
