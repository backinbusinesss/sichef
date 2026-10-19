import { db } from "../_lib/db.js";
import { json, error, cors, allow, readJson } from "../_lib/http.js";
import { requireAdmin } from "../_lib/auth.js";

const STATUSES = ["new", "read", "replied", "archived"];

function mapMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
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
          ? await sql`select * from contact_messages where status = ${status} order by created_at desc limit 400`
          : await sql`select * from contact_messages order by created_at desc limit 400`;
      return json(req, res, 200, { messages: rows.map(mapMessage) });
    }

    if (allow(req, res, ["GET", "PATCH", "DELETE"])) return;

    let body;
    try {
      body = await readJson(req);
    } catch {
      return error(req, res, 400, "Richiesta non valida.");
    }

    const id = String(req.query.id || body.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID messaggio non valido.");

    if (req.method === "DELETE") {
      const rows = await sql`delete from contact_messages where id = ${id} returning id`;
      if (!rows.length) return error(req, res, 404, "Messaggio non trovato.");
      return json(req, res, 200, { ok: true });
    }

    const status = body.status ? String(body.status) : null;
    if (status && !STATUSES.includes(status)) return error(req, res, 422, "Stato non valido.");

    const rows = await sql`
      update contact_messages set status = coalesce(${status}, status)
      where id = ${id} returning *
    `;
    if (!rows.length) return error(req, res, 404, "Messaggio non trovato.");
    return json(req, res, 200, { message: mapMessage(rows[0]) });
  } catch (err) {
    console.error("admin messages error", err);
    return error(req, res, 500, "Errore nella gestione dei messaggi.");
  }
}
