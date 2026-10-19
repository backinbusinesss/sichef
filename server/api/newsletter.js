import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (allow(req, res, ["POST"])) return;

  let body;
  try {
    body = await readJson(req);
  } catch {
    return error(req, res, 400, "Richiesta non valida.");
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return error(req, res, 422, "Inserisci un indirizzo email valido.");
  }

  try {
    await db()`
      insert into newsletter_subscribers (email) values (${email})
      on conflict (email) do nothing
    `;
    return json(req, res, 201, { ok: true });
  } catch (err) {
    console.error("newsletter error", err);
    return error(req, res, 500, "Iscrizione non riuscita. Riprova.");
  }
}
