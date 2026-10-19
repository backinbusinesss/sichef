import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
for (const f of [".env.local"]) {
  const t = readFileSync(f, "utf8");
  for (const line of t.split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const sql = neon(process.env.DATABASE_URL);
await sql`update menu_items i set image_url = '/assets/img/wine.webp' from categories c where c.id = i.category_id and c.slug = 'vini'`;
await sql`update menu_items i set image_url = '/assets/img/beer.webp' from categories c where c.id = i.category_id and c.slug = 'birre'`;
await sql`update menu_items i set image_url = '/assets/img/cocktail2.webp' from categories c where c.id = i.category_id and c.slug = 'cocktail'`;
const rows = await sql`select name, image_url from menu_items where category_id in (select id from categories where slug in ('vini','birre','cocktail'))`;
console.log(rows);
