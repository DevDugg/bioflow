"use server";

import { db } from "@/db/client";
import { links } from "@/db/schemas";
import { withErrorHandler } from "@/server/errors/error-handler";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

interface CreateLinkPayload {
  artistId: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
}

export const createLink = withErrorHandler(
  async (payload: CreateLinkPayload) => {
    // TODO: Add validation
    // TODO: Recalculate order
    const newLink = await db.insert(links).values(payload).returning();

    revalidatePath("/admin");
    revalidatePath(`/${(await getArtistFromLink(newLink[0].id))?.slug}`);

    return newLink[0];
  }
);

interface UpdateLinkPayload {
  id: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
}

export const updateLink = withErrorHandler(
  async (payload: UpdateLinkPayload) => {
    // TODO: Add validation
    const updatedLink = await db
      .update(links)
      .set({
        label: payload.label,
        url: payload.url,
        icon: payload.icon,
        badge: payload.badge,
      })
      .where(eq(links.id, payload.id))
      .returning();

    revalidatePath("/admin");
    revalidatePath(`/${(await getArtistFromLink(payload.id))?.slug}`);

    return updatedLink[0];
  }
);

export const updateLinkOrder = withErrorHandler(
  async (linksToUpdate: { id: string; order: number }[]) => {
    const artist = await getArtistFromLink(linksToUpdate[0].id);

    // Using a transaction to ensure all updates succeed or fail together
    await db.transaction(async (tx) => {
      for (const link of linksToUpdate) {
        await tx
          .update(links)
          .set({ order: link.order })
          .where(eq(links.id, link.id));
      }
    });

    revalidatePath("/admin");
    if (artist) {
      revalidatePath(`/${artist.slug}`);
    }

    return { success: true };
  }
);

export const deleteLink = withErrorHandler(async (linkId: string) => {
  const artist = await getArtistFromLink(linkId);
  const deletedLink = await db
    .delete(links)
    .where(eq(links.id, linkId))
    .returning();

  revalidatePath("/admin");
  if (artist) {
    revalidatePath(`/${artist.slug}`);
  }

  return deletedLink[0];
});

async function getArtistFromLink(linkId: string) {
  const link = await db.query.links.findFirst({
    where: eq(links.id, linkId),
    with: {
      artist: {
        columns: {
          slug: true,
        },
      },
    },
  });
  return link?.artist;
}
