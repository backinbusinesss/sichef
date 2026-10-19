import { db } from "./db.js";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 8;

export async function checkLoginLimit(ip, email) {
  const rows = await db()`
    select count(*)::int as count
    from login_attempts
    where created_at > now() - interval '15 minutes'
      and (ip = ${ip} or lower(email) = ${email.toLowerCase()})
  `;
  const count = rows[0]?.count ?? 0;
  return { allowed: count < MAX_ATTEMPTS, retryAfterSeconds: WINDOW_MINUTES * 60 };
}

export async function recordLoginFailure(ip, email) {
  await db()`
    insert into login_attempts (ip, email) values (${ip}, ${email.toLowerCase()})
  `;
}

export async function clearLoginFailures(ip, email) {
  await db()`
    delete from login_attempts
    where ip = ${ip} or lower(email) = ${email.toLowerCase()}
  `;
}

export async function pruneLoginAttempts() {
  await db()`delete from login_attempts where created_at < now() - interval '2 days'`;
}
