import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

for (const file of [".env.local", ".env"]) {
  try {
    const text = readFileSync(path.join(root, file), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (!match) continue;
      if (!process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL mancante.");
  process.exit(1);
}

const sql = neon(url);

/** Utility: controlla lo stato del database. */
const tables = await sql`
  select table_name, (select count(*) from information_schema.columns c where c.table_name = t.table_name) as columns
  from information_schema.tables t
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by table_name
`;

console.log("Tabelle:");
for (const t of tables) console.log(`  ${t.table_name} (${t.columns} colonne)`);

const counts = await Promise.all([
  sql`select count(*)::int as n from menu_items`,
  sql`select count(*)::int as n from categories`,
  sql`select count(*)::int as n from reservations`,
  sql`select count(*)::int as n from admin_users`,
]);
console.log(`\nmenu_items: ${counts[0][0].n}`);
console.log(`categories: ${counts[1][0].n}`);
console.log(`reservations: ${counts[2][0].n}`);
console.log(`admin_users: ${counts[3][0].n}`);
