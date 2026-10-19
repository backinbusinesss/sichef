import { db } from "../_lib/db.js";
import { json, error, cors, allow, readJson } from "../_lib/http.js";
import { requireAdmin } from "../_lib/auth.js";

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;
  if (allow(req, res, ["PATCH", "DELETE"])) return;

  let body;
  try {
    body = await readJson(req);
  } catch {
    return error(req, res, 400, "Richiesta non valida.");
  }

  const id = String(req.query.id || body.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID prenotazione non valido.");

  try {
    const sql = db();

    if (req.method === "DELETE") {
      const rows = await sql`delete from reservations where id = ${id} returning id`;
      if (!rows.length) return error(req, res, 404, "Prenotazione non trovata.");
      return json(req, res, 200, { ok: true });
    }

    const status = body.status ? String(body.status) : null;
    if (status && !STATUSES.includes(status)) return error(req, res, 422, "Stato non valido.");

    const rows = await sql`
      update reservations set
        status = coalesce(${status}, status),
        admin_notes = coalesce(${body.adminNotes !== undefined ? String(body.adminNotes) : null}, admin_notes),
        updated_at = now()
      where id = ${id}
      returning id, name, email, phone, party_size, date::text as date, time, area, occasion,
                notes, status, admin_notes, source, created_at
    `;
    if (!rows.length) return error(req, res, 404, "Prenotazione non trovata.");
    const r = rows[0];
    return json(req, res, 200, {
      reservation: {
        id: r.id, name: r.name, email: r.email, phone: r.phone, partySize: r.party_size,
        date: r.date, time: r.time, area: r.area, occasion: r.occasion, notes: r.notes,
        status: r.status, adminNotes: r.admin_notes, source: r.source, createdAt: r.created_at,
      },
    });
  } catch (err) {
    console.error("admin reservations error", err);
    return error(req, res, 500, "Errore nell'aggiornamento della prenotazione.");
  }
}
