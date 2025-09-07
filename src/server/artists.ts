"use server";

import { db } from "@/db/client";
import { artists } from "@/db/schemas/artists";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "./errors/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import { z } from "zod";
import { BadRequestError } from "./errors/bad-request-error";
import { revalidatePath } from "next/cache";

const GetArtistByHandlePayload = z.string().min(1, "Handle is required");

export const getArtistByHandle = withErrorHandler(async (handle: string) => {
  const validation = GetArtistByHandlePayload.safeParse(handle);
  if (!validation.success) {
    throw new BadRequestError(validation.error.message);
  }
  const validatedHandle = validation.data;

  const artist = await db.query.artists.findFirst({
    where: eq(artists.slug, validatedHandle),
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

const UpdateArtistPayload = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export const updateArtist = withErrorHandler(
  async (payload: z.infer<typeof UpdateArtistPayload>) => {
    const validation = UpdateArtistPayload.safeParse(payload);
    if (!validation.success) {
      throw new BadRequestError(validation.error.message);
    }
    const { id, ...data } = validation.data;

    const updatedArtist = await db
      .update(artists)
      .set(data)
      .where(eq(artists.id, id))
      .returning();

    revalidatePath("/admin/profile");
    revalidatePath(`/${updatedArtist[0].slug}`);

    return updatedArtist[0];
  }
);
