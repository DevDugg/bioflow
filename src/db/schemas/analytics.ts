import {
  pgTable,
  uuid,
  timestamp,
  text,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { meta } from "./utils";
import { links } from "./links";
import { owners } from "./owners";
import { relations, sql } from "drizzle-orm";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";

export const clicks = pgTable(
  "clicks",
  {
    ...meta,
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    ts: timestamp("ts", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    ip: text("ip"),
    ua: text("ua"),
    ref: text("ref"),
    country: text("country"),
    device: text("device"),
  },
  (table) => [
    index("clicks_link_ts_idx").on(table.linkId, table.ts),
    index("clicks_owner_ts_idx").on(table.ownerId, table.ts),
    pgPolicy("Allow owners to read analytics for their artist", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (select 1 from links join artists on links.artist_id = artists.id where links.id = ${table.linkId} and artists.owner_id = ${authUid})`,
    }),
  ],
);

export const clicksRelations = relations(clicks, ({ one }) => ({
  owner: one(owners, {
    fields: [clicks.ownerId],
    references: [owners.id],
  }),
  link: one(links, {
    fields: [clicks.linkId],
    references: [links.id],
  }),
}));
