import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";

export const db = drizzle(
  postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    prepare: false,
  }),
  { schema }
);
