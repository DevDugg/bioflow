"use server";

import { db } from "@/db/client";
import { clicks } from "@/db/schemas/analytics";
import { artists } from "@/db/schemas/artists";
import { links } from "@/db/schemas/links";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { withErrorHandler } from "./errors/error-handler";
import { getCurrentUser } from "./auth";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { z } from "zod";
import { ClickType } from "@/app/(admin)/dashboard/analytics/page";

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
  country: z.string().optional(),
  device: z.string().optional(),
  ref: z.string().optional(),
});

export const getAnalytics = withErrorHandler(
  async (payload: z.infer<typeof AnalyticsPayload>) => {
    const user = await getCurrentUser();
    const { from, to, country, device, ref } = AnalyticsPayload.parse(payload);

    const fromDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 7);
    const toDate = to ? endOfDay(new Date(to)) : new Date();

    const conditions = [
      eq(clicks.ownerId, user.id),
      gte(clicks.ts, fromDate.toISOString()),
      lte(clicks.ts, toDate.toISOString()),
    ];

    if (country) {
      conditions.push(eq(clicks.country, country));
    }
    if (device) {
      conditions.push(eq(clicks.device, device));
    }
    if (ref) {
      conditions.push(eq(clicks.ref, ref));
    }

    const data = await db.query.clicks.findMany({
      where: and(...conditions),
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

export const exportAnalytics = withErrorHandler(
  async (payload: z.infer<typeof AnalyticsPayload>) => {
    const data = await getAnalytics(payload);

    if ("errors" in data) {
      return data;
    }

    if (data.length === 0) {
      return "";
    }

    const headers = ["Link", "Date", "Country", "Device", "Referrer"];
    const rows = data.map((click: ClickType) => [
      click.link?.label ?? "N/A",
      format(new Date(click.ts), "LLL dd, y"),
      click.country ?? "N/A",
      click.device ?? "N/A",
      click.ref ?? "N/A",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row: string[]) => row.join(",")),
    ].join("\n");

    return csv;
  }
);

export const getFilterValues = withErrorHandler(async () => {
  const user = await getCurrentUser();
  const data = await db
    .select({
      country: clicks.country,
      device: clicks.device,
      ref: clicks.ref,
    })
    .from(clicks)
    .where(eq(clicks.ownerId, user.id));

  const countries = [
    ...new Set(data.map((row) => row.country).filter(Boolean)),
  ];
  const devices = [...new Set(data.map((row) => row.device).filter(Boolean))];
  const refs = [...new Set(data.map((row) => row.ref).filter(Boolean))];

  return { countries, devices, refs };
});
