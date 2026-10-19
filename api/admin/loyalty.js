import { randomBytes } from "crypto";
import { db } from "../_lib/db.js";
import { json, error, cors, allow, readJson } from "../_lib/http.js";
import { requireAdmin } from "../_lib/auth.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  const bytes = randomBytes(4);
  let out = "";
  for (let i = 0; i < 4; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `SC-${out}`;
}

function mapMember(row, txCount = 0) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    email: row.email,
    phone: row.phone,
    birthday: row.birthday ? String(row.birthday).slice(0, 10) : null,
    points: row.points,
    isActive: row.is_active,
    createdAt: row.created_at,
    transactions: txCount,
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res, json)) return;

  try {
    const sql = db();

    if (req.method === "GET") {
      const rows = await sql`
        select m.*, (select count(*)::int from loyalty_transactions t where t.member_id = m.id) as tx_count
        from loyalty_members m
        order by m.created_at desc limit 400
      `;
      return json(req, res, 200, { members: rows.map((row) => mapMember(row, row.tx_count)) });
    }

    let body;
    try {
      body = await readJson(req);
    } catch {
      return error(req, res, 400, "Richiesta non valida.");
    }

    if (req.method === "POST") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      if (name.length < 2) return error(req, res, 422, "Nome obbligatorio.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return error(req, res, 422, "Email non valida.");
      const points = Math.max(0, Number(body.points) || 0);
      let created = null;
      let lastError = null;
      for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
        try {
          const rows = await sql`
            insert into loyalty_members (code, name, email, phone, birthday, points)
            values (${makeCode()}, ${name}, ${email}, ${String(body.phone || "").slice(0, 30)},
                    ${body.birthday || null}, ${points})
            returning *
          `;
          created = rows[0];
        } catch (err) {
          lastError = err;
          if (String(err.message || "").includes("unique") && String(err.message || "").includes("email")) {
            return error(req, res, 409, "Email già presente.");
          }
          if (!String(err.message || "").includes("unique")) throw err;
        }
      }
      if (!created) throw lastError || new Error("CODE_GENERATION_FAILED");
      if (points > 0) {
        await sql`
          insert into loyalty_transactions (member_id, points, reason)
          values (${created.id}, ${points}, 'Assegnazione manuale')
        `;
      }
      return json(req, res, 201, { member: mapMember(created) });
    }

    if (allow(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;

    const id = String(req.query.id || body.id || "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return error(req, res, 400, "ID tessera non valido.");

    if (req.method === "DELETE") {
      const rows = await sql`delete from loyalty_members where id = ${id} returning id`;
      if (!rows.length) return error(req, res, 404, "Tessera non trovata.");
      return json(req, res, 200, { ok: true });
    }

    const currentRows = await sql`select * from loyalty_members where id = ${id}`;
    if (!currentRows.length) return error(req, res, 404, "Tessera non trovata.");
    const current = currentRows[0];

    const delta = Number(body.pointsDelta || 0);
    const newPoints = current.points + delta;
    if (!Number.isFinite(newPoints) || newPoints < 0) {
      return error(req, res, 422, "Il saldo punti non può diventare negativo.");
    }

    const rows = await sql`
      update loyalty_members set
        name = coalesce(${body.name ?? null}, name),
        email = coalesce(${body.email ? String(body.email).toLowerCase() : null}, email),
        phone = coalesce(${body.phone ?? null}, phone),
        birthday = coalesce(${body.birthday || null}, birthday),
        points = ${newPoints},
        is_active = coalesce(${body.isActive === undefined ? null : Boolean(body.isActive)}, is_active),
        updated_at = now()
      where id = ${id} returning *
    `;

    if (delta !== 0) {
      await sql`
        insert into loyalty_transactions (member_id, points, reason)
        values (${id}, ${delta}, ${String(body.reason || "Rettifica manuale")})
      `;
    }

    return json(req, res, 200, { member: mapMember(rows[0]) });
  } catch (err) {
    console.error("admin loyalty error", err);
    if (String(err.message || "").includes("unique")) return error(req, res, 409, "Email già presente.");
    return error(req, res, 500, "Errore nella gestione del programma fedeltà.");
  }
}
