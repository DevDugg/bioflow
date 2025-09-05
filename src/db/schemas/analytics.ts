import { pgTable, uuid, timestamp, text, index } from "drizzle-orm/pg-core";
import { meta } from "./utils";
import { links } from "./links";
import { owners } from "./owners";
import { relations } from "drizzle-orm";

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
  ]
);

export const clicksRelations = relations(clicks, ({ one }) => ({
  owner: one(owners, {
    fields: [clicks.ownerId],
    references: [owners.id],
  }),
}));
