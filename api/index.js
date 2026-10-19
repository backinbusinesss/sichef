import auth from "../server/api/auth.js";
import availability from "../server/api/availability.js";
import categories from "../server/api/categories.js";
import contact from "../server/api/contact.js";
import content from "../server/api/content.js";
import loyalty from "../server/api/loyalty.js";
import menuItems from "../server/api/menu-items.js";
import newsletter from "../server/api/newsletter.js";
import orders from "../server/api/orders.js";
import reservations from "../server/api/reservations.js";
import upload from "../server/api/upload.js";
import adminContent from "../server/api/admin/content.js";
import adminDashboard from "../server/api/admin/dashboard.js";
import adminLoyalty from "../server/api/admin/loyalty.js";
import adminMessages from "../server/api/admin/messages.js";
import adminOrders from "../server/api/admin/orders.js";
import adminReservations from "../server/api/admin/reservations.js";

/**
 * Unica Vercel Function del progetto.
 *
 * Il piano Hobby di Vercel consente al massimo 12 funzioni per deployment:
 * tenere un file per endpoint in /api le supera. Quindi tutti i moduli
 * vivono in server/api/ (fuori da /api) e questa funzione instrada ogni
 * richiesta in base al pathname originale, che Vercel conserva attraverso
 * la rewrite definita in vercel.json.
 */
const ROUTES = new Map([
  ["/api/auth", auth],
  ["/api/availability", availability],
  ["/api/categories", categories],
  ["/api/contact", contact],
  ["/api/content", content],
  ["/api/loyalty", loyalty],
  ["/api/menu-items", menuItems],
  ["/api/newsletter", newsletter],
  ["/api/orders", orders],
  ["/api/reservations", reservations],
  ["/api/upload", upload],
  ["/api/admin/content", adminContent],
  ["/api/admin/dashboard", adminDashboard],
  ["/api/admin/loyalty", adminLoyalty],
  ["/api/admin/messages", adminMessages],
  ["/api/admin/orders", adminOrders],
  ["/api/admin/reservations", adminReservations],
]);

export default async function handler(req, res) {
  console.debug("[router] incoming:", req.method, req.url, "headers:", JSON.stringify(Object.fromEntries(Object.entries(req.headers).filter(([k]) => k.startsWith("content") || k === "cookie"))));
  const pathname = (req.url || "/").split("?")[0].replace(/\/+$/, "") || "/";
  const route = ROUTES.get(pathname);

  if (!route) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(JSON.stringify({ error: "Endpoint non trovato." }));
    return;
  }

  return route(req, res);
}
