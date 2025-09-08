import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schemas",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // use DATABASE_SESSION_POOLER_URL when pushing migrations
    url: process.env.DATABASE_URL!,
  },
});
