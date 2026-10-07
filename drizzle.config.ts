import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url =
  process.env.DIRECT_DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!url) {
  throw new Error("DIRECT_DATABASE_URL, SUPABASE_DATABASE_URL, or DATABASE_URL is required");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
