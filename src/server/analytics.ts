"use server";

import { db } from "@/db/client";
import { clicks } from "@/db/schemas/analytics";
import { artists } from "@/db/schemas/artists";
import { links } from "@/db/schemas/links";
import { and, desc, eq, sql } from "drizzle-orm";
import { withErrorHandler } from "./errors/error-handler";
import { getCurrentUser } from "./auth";

export const getDashboardStats = withErrorHandler(async () => {
  const user = await getCurrentUser();
  const result = await db
    .select({
      totalClicks: sql<number>`count(distinct ${clicks.id})`.mapWith(Number),
      totalLinks: sql<number>`count(distinct ${links.id})`.mapWith(Number),
    })
    .from(artists)
    .leftJoin(links, eq(links.artistId, artists.id))
    .leftJoin(clicks, eq(clicks.linkId, links.id))
    .where(eq(artists.ownerId, user.id));

  const { totalClicks, totalLinks } = result[0];
  const avgClicks =
    totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0";

  return {
    totalClicks: totalClicks.toLocaleString(),
    totalLinks: totalLinks.toLocaleString(),
    avgClicks,
  };
});

export const getRecentClicks = withErrorHandler(async () => {
  const user = await getCurrentUser();
  return await db.query.clicks.findMany({
    where: eq(clicks.ownerId, user.id),
    orderBy: [desc(clicks.ts)],
    limit: 5,
    with: {
      link: {
        columns: {
          label: true,
        },
      },
    },
  });
});
