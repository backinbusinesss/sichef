import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;
  if (allow(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;

  try {
    const sql = db();

    if (req.method === "GET") {
      const rows = await sql`select * from categories order by sort_order, name`;
      return json(req, res, 200, {
        categories: rows.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline,
          description: c.description,
          kind: c.kind,
          emoji: c.emoji,
          sortOrder: c.sort_order,
          isActive: c.is_active,
        })),
      });
    }

    let body;
    try {
      body = await readJson(req);
    } catch {
      return error(req, res, 400, "Richiesta non valida.");
    }

    if (req.method === "POST") {
      const name = String(body.name || "").trim();
      if (name.length < 2) return error(req, res, 422, "Il nome della categoria è obbligatorio.");
      const slug = slugify(String(body.slug || name)) || `categoria-${Date.now()}`;
      const kind = body.kind === "drink" ? "drink" : "food";
      const rows = await sql`
        insert into categories (slug, name, tagline, description, kind, emoji, sort_order, is_active)
        values (${slug}, ${name}, ${String(body.tagline || "")}, ${String(body.description || "")},
                ${kind}, ${String(body.emoji || "")}, ${Number(body.sortOrder) || 0},
                ${body.isActive !== false})
        returning *
      `;
      const c = rows[0];
      return json(req, res, 201, {
        category: {
          id: c.id, slug: c.slug, name: c.name, tagline: c.tagline, description: c.description,
          kind: c.kind, emoji: c.emoji, sortOrder: c.sort_order, isActive: c.is_active,
        },
      });
    }

    const id = String(req.query.id || body.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID categoria non valido.");

    if (req.method === "DELETE") {
      const used = await sql`select count(*)::int as count from menu_items where category_id = ${id}`;
      if (used[0].count > 0) {
        return error(req, res, 409, "La categoria contiene piatti. Spostali o eliminali prima.");
      }
      const deleted = await sql`delete from categories where id = ${id} returning id`;
      if (!deleted.length) return error(req, res, 404, "Categoria non trovata.");
      return json(req, res, 200, { ok: true });
    }

    const current = (await sql`select * from categories where id = ${id}`)[0];
    if (!current) return error(req, res, 404, "Categoria non trovata.");
    const name = String(body.name ?? current.name).trim();
    if (name.length < 2) return error(req, res, 422, "Nome non valido.");

    const rows = await sql`
      update categories set
        name = ${name},
        slug = ${slugify(String(body.slug ?? current.slug)) || current.slug},
        tagline = ${String(body.tagline ?? current.tagline)},
        description = ${String(body.description ?? current.description)},
        kind = ${body.kind === "drink" || body.kind === "food" ? body.kind : current.kind},
        emoji = ${String(body.emoji ?? current.emoji)},
        sort_order = ${Number(body.sortOrder ?? current.sort_order) || 0},
        is_active = ${body.isActive !== undefined ? Boolean(body.isActive) : current.is_active},
        updated_at = now()
      where id = ${id} returning *
    `;
    const c = rows[0];
    return json(req, res, 200, {
      category: {
        id: c.id, slug: c.slug, name: c.name, tagline: c.tagline, description: c.description,
        kind: c.kind, emoji: c.emoji, sortOrder: c.sort_order, isActive: c.is_active,
      },
    });
  } catch (err) {
    console.error("categories error", err);
    if (String(err.message || "").includes("unique")) {
      return error(req, res, 409, "Esiste già una categoria con questo slug.");
    }
    return error(req, res, 500, "Errore nel salvataggio della categoria.");
  }
}
