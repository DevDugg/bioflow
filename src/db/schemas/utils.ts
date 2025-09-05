// src/db/utils.ts
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const meta = {
  id: uuid("id").defaultRandom().primaryKey(),
};

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
};
