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

const deletedReservations = await sql`
  delete from reservations
  where name ilike '%test%' or email ilike '%example.com%' or email ilike '%prova%'
  returning id, name, email
`;
console.log("Prenotazioni rimosse:", deletedReservations.length);

const deletedSubs = await sql`
  delete from newsletter_subscribers
  where email ilike '%example.com%' or email ilike '%prova%'
  returning email
`;
console.log("Iscritti newsletter rimossi:", deletedSubs.length);

const remaining = await sql`select count(*)::int as n from reservations`;
console.log("Prenotazioni rimaste:", remaining[0].n);
