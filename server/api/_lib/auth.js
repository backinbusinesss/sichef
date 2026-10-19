import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { parseCookies } from "./http.js";

export const SESSION_COOKIE = "sc_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 24) {
    throw new Error(
      "JWT_SECRET non configurato (minimo 24 caratteri). Aggiungilo alle env di Vercel.",
    );
  }
  return value;
}

export function signSession(payload) {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`,
  );
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export function getAdmin(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload || !payload.admin) return null;
  return payload;
}

/** Returns the session or writes a 401 and returns null. */
export function requireAdmin(req, res, json) {
  const admin = getAdmin(req);
  if (!admin) {
    json(req, res, 401, { error: "Sessione scaduta. Effettua di nuovo il login." });
    return null;
  }
  return admin;
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
