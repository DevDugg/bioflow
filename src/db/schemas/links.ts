import { text, pgTable, uuid } from "drizzle-orm/pg-core";
import { meta, timestamps } from "./utils";
import { artists } from "./artists";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  ...meta,
  url: text("url").notNull(),
  label: text("label").notNull(),
  artistId: uuid("artist_id")
    .references(() => artists.id)
    .notNull(),
  ...timestamps,
});

export const linksRelations = relations(links, ({ one }) => ({
  artist: one(artists, {
    fields: [links.artistId],
    references: [artists.id],
  }),
}));
