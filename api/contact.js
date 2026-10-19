import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson, clientIp } from "./_lib/http.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (allow(req, res, ["POST"])) return;

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
  const subject = String(body.subject || "").trim().slice(0, 160);
  const message = String(body.message || "").trim().slice(0, 4000);

  if (name.length < 2) errors.name = "Inserisci il tuo nome.";
  if (name.length > 90) errors.name = "Nome troppo lungo.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) errors.email = "Inserisci un'email valida.";
  if (message.length < 5) errors.message = "Scrivi un messaggio.";
  if (Object.keys(errors).length) return json(req, res, 422, { errors });

  try {
    const sql = db();
    const ip = clientIp(req);
    const [{ count }] = await sql`
      select count(*)::int as count from contact_messages
      where created_at > now() - interval '1 hour'
    `;
    if (count >= 80) return error(req, res, 429, "Troppi messaggi in questo momento. Riprova più tardi.");

    const rows = await sql`
      insert into contact_messages (name, email, phone, subject, message)
      values (${name}, ${email}, ${phone}, ${subject || "Messaggio dal sito"}, ${message})
      returning id, created_at
    `;

    console.info("contact message", { id: rows[0].id, ip, email });
    return json(req, res, 201, { ok: true });
  } catch (err) {
    console.error("contact error", err);
    return error(req, res, 500, "Invio non riuscito. Riprova o chiamaci.");
  }
}
