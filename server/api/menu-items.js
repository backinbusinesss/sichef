import { db, mapItem } from "./_lib/db.js";
import { json, error, cors, allow, readJson } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";

function toItem(row) {
  return mapItem({ ...row, allergens: row.allergens ?? [] });
}

async function loadItem(id) {
  const rows = await db()`
    select i.*, coalesce(array_agg(a.allergen_code) filter (where a.allergen_code is not null), '{}') as allergens
    from menu_items i
    left join menu_item_allergens a on a.item_id = i.id
    where i.id = ${id}
    group by i.id
  `;
  return rows[0] ? toItem(rows[0]) : null;
}

/** Normalizza e valida il payload di un piatto. */
function normalize(body) {
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const categoryId = String(body.categoryId || body.category_id || "");
  const allergens = Array.isArray(body.allergens) ? [...new Set(body.allergens.map(String))] : [];

  if (name.length < 2) return { error: "Il nome del piatto è obbligatorio." };
  if (!Number.isFinite(price) || price < 0 || price > 9999)
    return { error: "Prezzo non valido." };
  if (!/^[0-9a-f-]{36}$/i.test(categoryId)) return { error: "Categoria non valida." };

  return {
    data: {
      categoryId,
      name,
      description: String(body.description || "").trim().slice(0, 600),
      price: Math.round(price * 100) / 100,
      imageUrl: String(body.imageUrl || body.image_url || "").trim().slice(0, 800),
      isAvailable: body.isAvailable !== false,
      isFeatured: Boolean(body.isFeatured),
      isVegan: Boolean(body.isVegan),
      isVegetarian: Boolean(body.isVegetarian),
      isGlutenFree: Boolean(body.isGlutenFree),
      isSpicy: Boolean(body.isSpicy),
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      allergens,
    },
  };
}

async function syncAllergens(sql, itemId, codes) {
  await sql`delete from menu_item_allergens where item_id = ${itemId}`;
  for (const code of codes) {
    await sql`
      insert into menu_item_allergens (item_id, allergen_code)
      values (${itemId}, ${code}) on conflict do nothing
    `;
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;
  if (allow(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;

  try {
    const sql = db();

    if (req.method === "GET") {
      const rows = await sql`
        select i.*, coalesce(array_agg(a.allergen_code) filter (where a.allergen_code is not null), '{}') as allergens
        from menu_items i
        left join menu_item_allergens a on a.item_id = i.id
        group by i.id
        order by i.sort_order, i.name
      `;
      return json(req, res, 200, { items: rows.map(toItem) });
    }

    let body;
    try {
      body = await readJson(req);
    } catch {
      return error(req, res, 400, "Richiesta non valida.");
    }

    if (req.method === "POST") {
      const { data, error: message } = normalize(body);
      if (message) return error(req, res, 422, message);

      const rows = await sql`
        insert into menu_items (
          category_id, name, description, price, image_url, is_available, is_featured,
          is_vegan, is_vegetarian, is_gluten_free, is_spicy, sort_order
        ) values (
          ${data.categoryId}, ${data.name}, ${data.description}, ${data.price}, ${data.imageUrl},
          ${data.isAvailable}, ${data.isFeatured}, ${data.isVegan}, ${data.isVegetarian},
          ${data.isGlutenFree}, ${data.isSpicy}, ${data.sortOrder}
        ) returning id
      `;
      await syncAllergens(sql, rows[0].id, data.allergens);
      return json(req, res, 201, { item: await loadItem(rows[0].id) });
    }

    const id = String(req.query.id || body.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID piatto non valido.");

    if (req.method === "DELETE") {
      const deleted = await sql`delete from menu_items where id = ${id} returning id`;
      if (!deleted.length) return error(req, res, 404, "Piatto non trovato.");
      return json(req, res, 200, { ok: true });
    }

    // PATCH: aggiornamento parziale (toggle disponibilità, drag&drop, edit completo)
    const current = await loadItem(id);
    if (!current) return error(req, res, 404, "Piatto non trovato.");

    if (Object.keys(body).length === 1 && "isAvailable" in body) {
      const rows = await sql`
        update menu_items set is_available = ${Boolean(body.isAvailable)}, updated_at = now()
        where id = ${id} returning *
      `;
      return json(req, res, 200, { item: toItem({ ...rows[0], allergens: current.allergens }) });
    }

    const merged = {
      categoryId: current.categoryId,
      name: current.name,
      description: current.description,
      price: current.price,
      imageUrl: current.imageUrl,
      isAvailable: current.isAvailable,
      isFeatured: current.isFeatured,
      isVegan: current.isVegan,
      isVegetarian: current.isVegetarian,
      isGlutenFree: current.isGlutenFree,
      isSpicy: current.isSpicy,
      sortOrder: current.sortOrder,
      allergens: current.allergens,
      ...body,
    };
    const { data, error: message } = normalize(merged);
    if (message) return error(req, res, 422, message);

    await sql`
      update menu_items set
        category_id = ${data.categoryId},
        name = ${data.name},
        description = ${data.description},
        price = ${data.price},
        image_url = ${data.imageUrl},
        is_available = ${data.isAvailable},
        is_featured = ${data.isFeatured},
        is_vegan = ${data.isVegan},
        is_vegetarian = ${data.isVegetarian},
        is_gluten_free = ${data.isGlutenFree},
        is_spicy = ${data.isSpicy},
        sort_order = ${data.sortOrder},
        updated_at = now()
      where id = ${id}
    `;
    await syncAllergens(sql, id, data.allergens);
    return json(req, res, 200, { item: await loadItem(id) });
  } catch (err) {
    console.error("menu error", err);
    return error(req, res, 500, "Errore nel salvataggio del menu.");
  }
}
