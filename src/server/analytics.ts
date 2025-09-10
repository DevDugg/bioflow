"use server";

import { db } from "@/db/client";
import { clicks } from "@/db/schemas/analytics";
import { artists } from "@/db/schemas/artists";
import { links } from "@/db/schemas/links";
import { and, desc, eq, gte, sql, lte } from "drizzle-orm";
import { withErrorHandler } from "./errors/error-handler";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";

import { subDays, format, startOfDay, endOfDay } from "date-fns";

import { z } from "zod";

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

export const getClicksChartData = withErrorHandler(async () => {
  const user = await getCurrentUser();
  const today = new Date();
  const last7Days = subDays(today, 7);

  const dailyClicks = await db
    .select({
      date: sql<string>`date_trunc('day', ${clicks.ts})`.mapWith(String),
      count: sql<number>`count(${clicks.id})`.mapWith(Number),
    })
    .from(clicks)
    .where(
      and(eq(clicks.ownerId, user.id), gte(clicks.ts, last7Days.toISOString()))
    )
    .groupBy(sql`date_trunc('day', ${clicks.ts})`);

  const clicksByDate = dailyClicks.reduce((acc, { date, count }) => {
    acc[format(new Date(date), "yyyy-MM-dd")] = count;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    return {
      name: format(date, "EEE"),
      clicks: clicksByDate[formattedDate] || 0,
    };
  }).reverse();

  return chartData;
});

const AnalyticsPayload = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const getAnalytics = withErrorHandler(
  async (payload: z.infer<typeof AnalyticsPayload>) => {
    const user = await getCurrentUser();
    const { from, to } = AnalyticsPayload.parse(payload);

    const fromDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 7);
    const toDate = to ? endOfDay(new Date(to)) : new Date();

    const data = await db.query.clicks.findMany({
      where: and(
        eq(clicks.ownerId, user.id),
        gte(clicks.ts, fromDate.toISOString()),
        lte(clicks.ts, toDate.toISOString())
      ),
      with: {
        link: {
          columns: {
            label: true,
          },
        },
      },
      orderBy: [desc(clicks.ts)],
    });

    return data;
  }
);
