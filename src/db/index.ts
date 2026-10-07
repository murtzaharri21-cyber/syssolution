import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __sysSolutionsPostgresClient?: ReturnType<typeof postgres>;
};

/**
 * Supabase's transaction pooler is the recommended connection for Vercel.
 * `prepare: false` is required for transaction-mode poolers. Vercel functions
 * keep a single connection while local development can use a small pool.
 */
export const client =
  globalForDb.__sysSolutionsPostgresClient ??
  postgres(databaseUrl, {
    prepare: false,
    max: process.env.VERCEL ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__sysSolutionsPostgresClient = client;
}

export const db = drizzle(client);
