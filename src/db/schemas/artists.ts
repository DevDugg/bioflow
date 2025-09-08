import {
  pgTable,
  text,
  uuid,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { meta, timestamps } from "./utils";
import { links } from "./links";
import { owners } from "./owners";

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
  ]
);

export const artistsRelations = relations(artists, ({ many, one }) => ({
  links: many(links),
  owner: one(owners, {
    fields: [artists.ownerId],
    references: [owners.id],
  }),
}));
