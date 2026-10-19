import { randomBytes } from "crypto";
import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson, clientIp } from "./_lib/http.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  const bytes = randomBytes(4);
  let out = "";
  for (let i = 0; i < 4; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `SC-${out}`;
}

function mapMember(row) {
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
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // ---- consultazione punti (email + codice)
  if (req.method === "GET") {
    const email = String(req.query.email || "").trim().toLowerCase();
    const code = String(req.query.code || "").trim().toUpperCase();
    if (!email || !code) return error(req, res, 400, "Inserisci email e codice tessera.");
    try {
      const sql = db();
      const rows = await sql`
        select * from loyalty_members where lower(email) = ${email} and upper(code) = ${code}
      `;
      if (!rows.length) return error(req, res, 404, "Tessera non trovata. Controlla email e codice.");
      const transactions = await sql`
        select id, points, reason, created_at from loyalty_transactions
        where member_id = ${rows[0].id} order by created_at desc limit 20
      `;
      return json(req, res, 200, {
        member: mapMember(rows[0]),
        transactions: transactions.map((t) => ({
          id: t.id,
          points: t.points,
          reason: t.reason,
          createdAt: t.created_at,
        })),
      });
    } catch (err) {
      console.error("loyalty lookup error", err);
      return error(req, res, 500, "Impossibile recuperare la tessera.");
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
  const phone = String(body.phone || "").trim().slice(0, 30);
  const birthday = String(body.birthday || "").trim();

  if (name.length < 2) errors.name = "Inserisci il tuo nome.";
  if (name.length > 80) errors.name = "Nome troppo lungo.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) errors.email = "Inserisci un'email valida.";
  if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) errors.birthday = "Data non valida.";
  if (Object.keys(errors).length) return json(req, res, 422, { errors });

  try {
    const sql = db();
    const ip = clientIp(req);
    const [{ count }] = await sql`
      select count(*)::int as count from loyalty_members
      where created_at > now() - interval '1 hour'
    `;
    if (count >= 60) return error(req, res, 429, "Troppe iscrizioni in questo momento. Riprova più tardi.");

    const existing = await sql`select id, email from loyalty_members where lower(email) = ${email} limit 1`;
    if (existing.length) {
      return error(req, res, 409, "Questa email è già iscritta. Usa la ricerca punti con il tuo codice tessera.");
    }

    const settingsRows = await sql`select value from site_settings where key = 'loyalty'`;
    const settings = settingsRows[0]?.value || {};
    const welcomePoints = Number(settings.welcomePoints ?? 20) || 0;

    let created = null;
    let lastError = null;
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      const code = makeCode();
      try {
        const rows = await sql`
          insert into loyalty_members (code, name, email, phone, birthday, points)
          values (${code}, ${name}, ${email}, ${phone || ""}, ${birthday || null}, ${welcomePoints})
          returning *
        `;
        created = rows[0];
      } catch (err) {
        lastError = err;
        if (!String(err.message || "").includes("unique")) throw err;
      }
    }
    if (!created) throw lastError || new Error("CODE_GENERATION_FAILED");

    if (welcomePoints > 0) {
      await sql`
        insert into loyalty_transactions (member_id, points, reason)
        values (${created.id}, ${welcomePoints}, 'Bonus di benvenuto')
      `;
    }

    return json(req, res, 201, { ok: true, member: mapMember(created), welcomePoints });
  } catch (err) {
    console.error("loyalty create error", err);
    return error(req, res, 500, "Iscrizione non riuscita. Riprova.");
  }
}
