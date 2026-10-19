import { db } from "../_lib/db.js";
import { json, error, cors, allow, readJson } from "../_lib/http.js";
import { requireAdmin } from "../_lib/auth.js";

const STATUSES = ["pending", "confirmed", "preparing", "ready", "delivering", "completed", "cancelled"];

const ORDER_SELECT = `
  select o.*,
         coalesce(
           json_agg(json_build_object('id', oi.id, 'name', oi.name, 'price', oi.price, 'quantity', oi.quantity)
                    order by oi.name) filter (where oi.id is not null),
           '[]'
         ) as items
  from orders o
  left join order_items oi on oi.order_id = o.id
`;

function mapOrder(row) {
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
    items: (row.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;

  try {
    const sql = db();

    if (req.method === "GET") {
      const status = String(req.query.status || "");
      const rows =
        status && status !== "all"
          ? await sql.query(`${ORDER_SELECT} where o.status = $1 group by o.id order by o.created_at desc limit 400`, [status])
          : await sql.query(`${ORDER_SELECT} group by o.id order by o.created_at desc limit 400`);
      return json(req, res, 200, { orders: rows.map(mapOrder) });
    }

    if (allow(req, res, ["GET", "PATCH", "DELETE"])) return;

    let body;
    try {
      body = await readJson(req);
    } catch {
      return error(req, res, 400, "Richiesta non valida.");
    }

    const id = String(req.query.id || body.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID ordine non valido.");

    if (req.method === "DELETE") {
      const rows = await sql`delete from orders where id = ${id} returning id`;
      if (!rows.length) return error(req, res, 404, "Ordine non trovato.");
      return json(req, res, 200, { ok: true });
    }

    const status = body.status ? String(body.status) : null;
    if (status && !STATUSES.includes(status)) return error(req, res, 422, "Stato non valido.");

    await sql`
      update orders set
        status = coalesce(${status}, status),
        admin_notes = coalesce(${body.adminNotes !== undefined ? String(body.adminNotes) : null}, admin_notes),
        updated_at = now()
      where id = ${id}
    `;

    const rows = await sql.query(`${ORDER_SELECT} where o.id = $1 group by o.id`, [id]);
    if (!rows.length) return error(req, res, 404, "Ordine non trovato.");
    return json(req, res, 200, { order: mapOrder(rows[0]) });
  } catch (err) {
    console.error("admin orders error", err);
    return error(req, res, 500, "Errore nella gestione degli ordini.");
  }
}
