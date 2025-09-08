import { pgTable, text, uuid, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { meta, timestamps } from "./utils";
import { artists } from "./artists";

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
    ...timestamps,
  },
  (table) => [index("links_artist_order_idx").on(table.artistId, table.order)]
);

export const linksRelations = relations(links, ({ one }) => ({
  artist: one(artists, {
    fields: [links.artistId],
    references: [artists.id],
  }),
}));
