import { neon } from "@neondatabase/serverless";

let cached = null;

export function databaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  );
}

/** Tagged-template SQL client (HTTP, no pool to manage). */
export function db() {
  if (cached) return cached;
  const url = databaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL non configurata. Collega Neon al progetto o crea .env.local.",
    );
  }
  cached = neon(url);
  return cached;
}

export function isDbConfigured() {
  return Boolean(databaseUrl());
}

/** Converte una colonna `date` in stringa YYYY-MM-DD, senza slittamenti di fuso. */
export function isoDate(value) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** Shortcut for parameterised queries. */
export function query(text, params = []) {
  return db().query(text, params);
}

export function mapItem(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    imageUrl: row.image_url ?? "",
    isAvailable: row.is_available,
    isFeatured: row.is_featured,
    isVegan: row.is_vegan,
    isVegetarian: row.is_vegetarian,
    isGlutenFree: row.is_gluten_free,
    isSpicy: row.is_spicy,
    sortOrder: row.sort_order,
    allergens: row.allergens ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
