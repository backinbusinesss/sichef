import { randomBytes } from "crypto";
import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson, clientIp } from "./_lib/http.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `SC-${out}`;
}

function mapOrder(row, items) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    email: row.email,
    phone: row.phone,
    fulfilment: row.fulfilment,
    address: row.address,
    pickupTime: row.pickup_time,
    notes: row.notes,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    adminNotes: row.admin_notes,
    source: row.source,
    createdAt: row.created_at,
    items,
  };
}

async function loadOrderById(sql, id) {
  const rows = await sql`select * from orders where id = ${id}`;
  if (!rows.length) return null;
  const itemRows = await sql`
    select id, menu_item_id, name, price, quantity from order_items where order_id = ${id} order by name
  `;
  return mapOrder(
    rows[0],
    itemRows.map((item) => ({
      id: item.id,
      menuItemId: item.menu_item_id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
  );
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // ---- stato ordine pubblico tramite codice
  if (req.method === "GET") {
    const code = String(req.query.code || "").trim().toUpperCase();
    if (!/^SC-[A-Z0-9]{6}$/.test(code)) return error(req, res, 400, "Codice ordine non valido.");
    try {
      const sql = db();
      const rows = await sql`select * from orders where code = ${code}`;
      if (!rows.length) return error(req, res, 404, "Ordine non trovato.");
      const itemRows = await sql`
        select id, menu_item_id, name, price, quantity from order_items where order_id = ${rows[0].id} order by name
      `;
      return json(req, res, 200, {
        order: mapOrder(
          rows[0],
          itemRows.map((item) => ({
            id: item.id,
            menuItemId: item.menu_item_id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
          })),
        ),
      });
    } catch (err) {
      console.error("order lookup error", err);
      return error(req, res, 500, "Impossibile recuperare l'ordine.");
    }
  }

  if (allow(req, res, ["GET", "POST"])) return;

  let body;
  try {
    body = await readJson(req);
  } catch {
    return error(req, res, 400, "Richiesta non valida.");
  }

  const errors = {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const fulfilment = body.fulfilment === "delivery" ? "delivery" : "pickup";
  const address = String(body.address || "").trim().slice(0, 300);
  const pickupTime = String(body.pickupTime || "Prima possibile").trim().slice(0, 40);
  const notes = String(body.notes || "").trim().slice(0, 600);

  if (name.length < 2) errors.name = "Inserisci il tuo nome.";
  if (name.length > 80) errors.name = "Nome troppo lungo.";
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) errors.email = "Email non valida.";
  if (!/^[+\d][\d\s./()-]{5,24}$/.test(phone)) errors.phone = "Numero di telefono non valido.";
  if (fulfilment === "delivery" && address.length < 5) errors.address = "Inserisci l'indirizzo di consegna.";

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = [];
  for (const raw of rawItems) {
    const id = String(raw?.id || raw?.menuItemId || "");
    const quantity = Number(raw?.quantity || 0);
    if (!/^[0-9a-f-]{36}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      errors.items = "Alcune voci del carrello non sono valide.";
      break;
    }
    items.push({ id, quantity });
  }
  if (!items.length) errors.items = "Il carrello è vuoto.";
  if (items.length > 40) errors.items = "Troppe voci nell'ordine: chiamaci direttamente.";

  if (Object.keys(errors).length) return json(req, res, 422, { errors });

  try {
    const sql = db();
    const ip = clientIp(req);

    const [{ count }] = await sql`
      select count(*)::int as count from orders
      where created_at > now() - interval '1 hour' and source = ${`web:${ip}`}
    `;
    if (count >= 10) {
      return error(req, res, 429, "Hai inviato troppi ordini. Chiamaci direttamente.");
    }

    const ids = items.map((item) => item.id);
    const menuRows = await sql`
      select id, name, price, is_available from menu_items where id = any(${ids}::uuid[])
    `;
    const menuMap = new Map(menuRows.map((row) => [row.id, row]));

    for (const item of items) {
      const menuItem = menuMap.get(item.id);
      if (!menuItem || !menuItem.is_available) {
        return error(req, res, 409, "Alcuni piatti non sono più disponibili. Aggiorna il carrello.");
      }
    }

    const lines = items.map((item) => {
      const menuItem = menuMap.get(item.id);
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity: item.quantity,
      };
    });

    const subtotal = Math.round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0) * 100) / 100;

    const settingsRows = await sql`
      select key, value from site_settings where key in ('order', 'venue')
    `;
    const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value || {}]));
    const orderSettings = settings.order || {};
    const venueSettings = settings.venue || {};
    const deliveryFee = Number(orderSettings.deliveryFee ?? venueSettings.deliveryFee ?? 3) || 0;
    const deliveryMinimum = Number(orderSettings.deliveryMinimum ?? venueSettings.deliveryMinimum ?? 20) || 0;

    if (fulfilment === "delivery" && subtotal < deliveryMinimum) {
      return json(req, res, 422, {
        errors: { items: `Il minimo per la consegna è ${deliveryMinimum.toFixed(2).replace(".", ",")} €.` },
        error: `Il minimo per la consegna è ${deliveryMinimum.toFixed(2).replace(".", ",")} €.`,
      });
    }

    const fee = fulfilment === "delivery" ? deliveryFee : 0;
    const total = Math.round((subtotal + fee) * 100) / 100;

    let created = null;
    let lastError = null;
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      const code = makeCode();
      try {
        const rows = await sql`
          insert into orders (
            code, name, email, phone, fulfilment, address, pickup_time, notes,
            subtotal, delivery_fee, total, source
          ) values (
            ${code}, ${name}, ${email}, ${phone}, ${fulfilment}, ${address}, ${pickupTime}, ${notes},
            ${subtotal}, ${fee}, ${total}, ${`web:${ip}`}
          ) returning *
        `;
        created = rows[0];
      } catch (err) {
        lastError = err;
        if (!String(err.message || "").includes("unique")) throw err;
      }
    }
    if (!created) throw lastError || new Error("CODE_GENERATION_FAILED");

    try {
      for (const line of lines) {
        await sql`
          insert into order_items (order_id, menu_item_id, name, price, quantity)
          values (${created.id}, ${line.menuItemId}, ${line.name}, ${line.price}, ${line.quantity})
        `;
      }
    } catch (err) {
      await sql`delete from orders where id = ${created.id}`.catch(() => {});
      throw err;
    }

    const order = await loadOrderById(sql, created.id);
    return json(req, res, 201, { ok: true, order });
  } catch (err) {
    console.error("order create error", err);
    return error(req, res, 500, "Non siamo riusciti a inviare l'ordine. Riprova o chiamaci.");
  }
}
