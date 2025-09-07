"use server";

import { db } from "@/db/client";
import { artists } from "@/db/schemas/artists";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "./errors/error-handler";
import { NotFoundError } from "./errors/not-found-error";

export const getArtistByHandle = withErrorHandler(async (handle: string) => {
  const artist = await db.query.artists.findFirst({
    where: eq(artists.slug, handle),
    with: {
      links: {
        orderBy: (links, { asc }) => [asc(links.order)],
      },
    },
  });

  if (!artist) {
    throw new NotFoundError();
  }

  return artist;
});
