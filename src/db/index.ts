import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalForDb = globalThis as typeof globalThis & {
  __sysSolutionsDatabaseUrl?: string;
  __sysSolutionsDrizzle?: ReturnType<typeof drizzle>;
};

/**
 * Supabase's transaction pooler is the recommended connection for Vercel.
 * `prepare: false` is required for transaction-mode poolers. Vercel functions
 * keep a single connection while local development can use a small pool.
 */
export function getDb() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL is required");
  }

  if (globalForDb.__sysSolutionsDatabaseUrl === databaseUrl && globalForDb.__sysSolutionsDrizzle) {
    return globalForDb.__sysSolutionsDrizzle;
  }

  const database = drizzle(postgres(databaseUrl, {
    prepare: false,
    max: process.env.VERCEL ? 1 : 5,
    idle_timeout: process.env.VERCEL ? 5 : 20,
    max_lifetime: process.env.VERCEL ? 60 : null,
    connect_timeout: 10,
  }));

  globalForDb.__sysSolutionsDatabaseUrl = databaseUrl;
  globalForDb.__sysSolutionsDrizzle = database;
  return database;
}
