import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { meta, timestamps } from "./utils";

export const waitlist = pgTable(
  "waitlist",
  {
    ...meta,
    email: text("email").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("waitlist_email_unique").on(table.email)]
);
