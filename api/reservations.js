import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson, isIsoDate, clientIp } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";

const AREAS = ["sala", "dehor", "veranda", "privato"];

function validate(body) {
  const errors = {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const date = String(body.date || "");
  const time = String(body.time || "");
  const area = String(body.area || "sala");
  const partySize = Number(body.partySize || body.party_size || 0);
  const notes = String(body.notes || "").trim().slice(0, 800);
  const occasion = String(body.occasion || "").trim().slice(0, 120);

  if (name.length < 2) errors.name = "Inserisci il tuo nome.";
  if (name.length > 80) errors.name = "Nome troppo lungo.";
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) errors.email = "Email non valida.";
  if (!/^[+\d][\d\s./()-]{5,24}$/.test(phone)) errors.phone = "Numero di telefono non valido.";
  if (!isIsoDate(date)) errors.date = "Scegli una data.";
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Scegli un orario.";
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 30)
    errors.partySize = "Numero di persone non valido.";
  if (!AREAS.includes(area)) errors.area = "Scegli una zona.";

  return {
    errors,
    data: { name, email, phone, date, time, area, partySize, notes, occasion },
  };
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // ---- lista prenotazioni (admin)
  if (req.method === "GET") {
    if (!requireAdmin(req, res, json)) return;
    try {
      const status = String(req.query.status || "");
      const from = String(req.query.from || "");
      const rows =
        status && status !== "all"
          ? await db()`select id, name, email, phone, party_size, date::text as date, time, area, occasion, notes, status, admin_notes, source, created_at from reservations where status = ${status} order by date desc, time desc limit 400`
          : from
            ? await db()`select id, name, email, phone, party_size, date::text as date, time, area, occasion, notes, status, admin_notes, source, created_at from reservations where date >= ${from}::date order by date asc, time asc limit 400`
            : await db()`select id, name, email, phone, party_size, date::text as date, time, area, occasion, notes, status, admin_notes, source, created_at from reservations order by date desc, time desc limit 400`;
      return json(req, res, 200, {
        reservations: rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          partySize: r.party_size,
          date: r.date,
          time: r.time,
          area: r.area,
          occasion: r.occasion,
          notes: r.notes,
          status: r.status,
          adminNotes: r.admin_notes,
          source: r.source,
          createdAt: r.created_at,
        })),
      });
    } catch (err) {
      console.error("reservations list error", err);
      return error(req, res, 500, "Impossibile caricare le prenotazioni.");
    }
  }

  if (allow(req, res, ["GET", "POST"])) return;

  // ---- crea prenotazione (pubblico)
  let body;
  try {
    body = await readJson(req);
  } catch {
    return error(req, res, 400, "Richiesta non valida.");
  }

  const { errors, data } = validate(body);
  if (Object.keys(errors).length) return json(req, res, 422, { errors });

  try {
    const sql = db();
    const ip = clientIp(req);

    // rate limit semplice: max 6 richieste/ora per IP
    const [{ count }] = await sql`
      select count(*)::int as count from reservations
      where created_at > now() - interval '1 hour' and source = ${`web:${ip}`}
    `;
    if (count >= 6) {
      return error(req, res, 429, "Hai inviato troppe richieste. Chiamaci direttamente.");
    }

    const closed = await sql`select reason from closed_dates where date = ${data.date}::date`;
    if (closed.length) {
      return error(req, res, 409, closed[0].reason || "Siamo chiusi in questa data.");
    }

    const existing = await sql`
      select id from reservations
      where date = ${data.date}::date and time = ${data.time}
        and lower(phone) = ${data.phone.toLowerCase()}
        and status in ('pending', 'confirmed')
    `;
    if (existing.length) {
      return error(req, res, 409, "Risulta già una prenotazione con questi dati. Ti ricontatteremo.");
    }

    const rows = await sql`
      insert into reservations (name, email, phone, party_size, date, time, area, occasion, notes, source)
      values (${data.name}, ${data.email}, ${data.phone}, ${data.partySize}, ${data.date}::date,
              ${data.time}, ${data.area}, ${data.occasion}, ${data.notes}, ${`web:${ip}`})
      returning id, date::text as date, time, party_size, status
    `;

    const created = rows[0];
    return json(req, res, 201, {
      ok: true,
      reservation: {
        id: created.id,
        date: created.date,
        time: created.time,
        partySize: created.party_size,
        status: created.status,
      },
    });
  } catch (err) {
    console.error("reservation create error", err);
    return error(req, res, 500, "Non siamo riusciti a salvare la prenotazione. Riprova.");
  }
}
