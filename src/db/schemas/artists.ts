import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { links } from "./links";
import { meta, timestamps } from "./utils";

export const artists = pgTable("artists", {
  ...meta,
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  slug: text("slug").notNull(),
  ...timestamps,
});

export const artistsRelations = relations(artists, ({ many }) => ({
  links: many(links),
}));
