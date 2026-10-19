import { db } from "./_lib/db.js";
import { json, error, cors, allow, readJson, clientIp } from "./_lib/http.js";
import {
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  getAdmin,
} from "./_lib/auth.js";
import {
  checkLoginLimit,
  recordLoginFailure,
  clearLoginFailures,
  pruneLoginAttempts,
} from "./_lib/rateLimit.js";

export default async function handler(req, res) {
  if (cors(req, res)) return;

  // GET /api/auth -> chi sono
  if (req.method === "GET") {
    const admin = getAdmin(req);
    if (!admin) return json(req, res, 200, { authenticated: false });
    return json(req, res, 200, {
      authenticated: true,
      user: { email: admin.email, name: admin.name },
    });
  }

  // DELETE /api/auth -> logout
  if (req.method === "DELETE") {
    clearSessionCookie(res);
    return json(req, res, 200, { ok: true });
  }

  if (allow(req, res, ["GET", "POST", "DELETE"])) return;

  let body;
  try {
    body = await readJson(req);
  } catch {
    return error(req, res, 400, "Richiesta non valida.");
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return error(req, res, 422, "Inserisci email e password.");

  const ip = clientIp(req);

  try {
    const limit = await checkLoginLimit(ip, email);
    if (!limit.allowed) {
      return error(req, res, 429, "Troppi tentativi. Riprova tra qualche minuto.");
    }

    const rows = await db()`
      select id, email, name, password_hash from admin_users where lower(email) = ${email} limit 1
    `;
    const user = rows[0];
    const ok = user ? await verifyPassword(password, user.password_hash) : false;

    if (!user || !ok) {
      await recordLoginFailure(ip, email);
      return error(req, res, 401, "Credenziali non corrette.");
    }

    await clearLoginFailures(ip, email).catch(() => {});
    await pruneLoginAttempts().catch(() => {});
    await db()`update admin_users set last_login_at = now() where id = ${user.id}`;

    const token = signSession({ sub: user.id, email: user.email, name: user.name, admin: true });
    setSessionCookie(res, token);
    return json(req, res, 200, { ok: true, user: { email: user.email, name: user.name } });
  } catch (err) {
    console.error("auth error", err);
    return error(req, res, 500, "Errore di autenticazione. Riprova.");
  }
}
