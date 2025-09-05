import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { artists } from "./artists";
import { timestamps } from "./utils";

export const owners = pgTable("owners", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  ...timestamps,
});

export const ownersRelations = relations(owners, ({ many }) => ({
  artists: many(artists),
}));
