import {
  pgTable,
  text,
  uuid,
  integer,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { meta, timestamps } from "./utils";
import { artists } from "./artists";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";
import { pgEnum } from "drizzle-orm/pg-core";

export const linkTypeEnum = pgEnum("link_type", ["link", "social", "video"]);

export const links = pgTable(
  "links",
  {
    ...meta,
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    order: integer("order").notNull().default(0),
    icon: text("icon"),
    badge: text("badge"),
    linkType: linkTypeEnum("link_type").notNull().default("link"),
    ...timestamps,
  },
  (table) => [
    index("links_artist_order_idx").on(table.artistId, table.order),
    pgPolicy("Allow public read access to links", {
      for: "select",
      using: sql`true`,
    }),
    pgPolicy("Allow authenticated users to insert links for their artist", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`exists (select 1 from artists where artists.id = ${table.artistId} and artists.owner_id = ${authUid})`,
    }),
    pgPolicy("Allow owners to update their links", {
      for: "update",
      to: authenticatedRole,
      using: sql`exists (select 1 from artists where artists.id = ${table.artistId} and artists.owner_id = ${authUid})`,
      withCheck: sql`exists (select 1 from artists where artists.id = ${table.artistId} and artists.owner_id = ${authUid})`,
    }),
    pgPolicy("Allow owners to delete their links", {
      for: "delete",
      to: authenticatedRole,
      using: sql`exists (select 1 from artists where artists.id = ${table.artistId} and artists.owner_id = ${authUid})`,
    }),
  ]
);

export const linksRelations = relations(links, ({ one }) => ({
  artist: one(artists, {
    fields: [links.artistId],
    references: [artists.id],
  }),
}));
