import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid, pgPolicy } from "drizzle-orm/pg-core";
import { artists } from "./artists";
import { timestamps } from "./utils";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";

export const owners = pgTable(
  "owners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    ...timestamps,
  },
  (table) => [
    pgPolicy("Allow all access for owners", {
      for: "all",
      to: authenticatedRole,
      using: sql`id = ${authUid}`,
      withCheck: sql`id = ${authUid}`,
    }),
  ]
);

export const ownersRelations = relations(owners, ({ many }) => ({
  artists: many(artists),
}));
