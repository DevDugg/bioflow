import {
  pgTable,
  text,
  uuid,
  jsonb,
  index,
  uniqueIndex,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { meta, timestamps } from "./utils";
import { links } from "./links";
import { owners } from "./owners";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";

export const artists = pgTable(
  "artists",
  {
    ...meta,
    ownerId: uuid("owner_id")
      .references(() => owners.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    image: text("image"),
    slug: text("slug").notNull(),
    status: text("status").notNull().default("published"),
    theme: jsonb("theme").$type<{
      background?: string;
      foreground?: string;
      card?: string;
      cardForeground?: string;
      primary?: string;
      primaryForeground?: string;
      secondary?: string;
      secondaryForeground?: string;
      accent?: string;
      accentForeground?: string;
    }>(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("artists_slug_unique").on(table.slug),
    index("artists_owner_idx").on(table.ownerId),
    pgPolicy("Allow public read access to artists", {
      for: "select",
      using: sql`true`,
    }),
    pgPolicy("Allow authenticated users to insert their own artist", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid} = owner_id`,
    }),
    pgPolicy("Allow owners to update their own artist", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid} = owner_id`,
      withCheck: sql`${authUid} = owner_id`,
    }),
    pgPolicy("Allow owners to delete their own artist", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${authUid} = owner_id`,
    }),
  ]
);

export const artistsRelations = relations(artists, ({ many, one }) => ({
  links: many(links),
  owner: one(owners, {
    fields: [artists.ownerId],
    references: [owners.id],
  }),
}));
