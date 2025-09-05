import { timestamp, uuid } from "drizzle-orm/pg-core";

export const meta = {
  id: uuid("id").primaryKey().defaultRandom(),
};

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
};
