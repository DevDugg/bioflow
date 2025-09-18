"use server";

import { db } from "@/db/client";
import { links } from "@/db/schemas";
import { withErrorHandler } from "@/server/errors/error-handler";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withZod } from "@/server/errors/with-zod";
import { BadRequestError } from "./errors/bad-request-error";
import { linkTypeEnum } from "@/db/schemas";

const CreateLinkPayload = z.object({
  artistId: z.uuid(),
  label: z.string().min(1, "Label is required"),
  url: z.url("Invalid URL format"),
  icon: z.string().optional(),
  badge: z.string().optional(),
  linkType: z.enum(linkTypeEnum.enumValues).optional().default("link"),
});

export const createLink = withErrorHandler(
  withZod(CreateLinkPayload, async (data) => {
    const newLink = await db.insert(links).values(data).returning();

    revalidatePath("/admin");
    const artist = await getArtistFromLink(newLink[0].id);
    if (artist) {
      revalidatePath(`/subdomain/${artist.slug}`);
    }

    return newLink[0];
  })
);

const UpdateLinkPayload = z.object({
  id: z.uuid(),
  label: z.string().min(1, "Label is required"),
  url: z.url("Invalid URL format"),
  icon: z.string().optional(),
  badge: z.string().optional(),
  linkType: z.enum(linkTypeEnum.enumValues).optional().default("link"),
});

export const updateLink = withErrorHandler(
  async (payload: z.infer<typeof UpdateLinkPayload>) => {
    const validation = UpdateLinkPayload.safeParse(payload);
    if (!validation.success) {
      throw new BadRequestError(validation.error.message);
    }
    const { id, ...data } = validation.data;

    const updatedLink = await db
      .update(links)
      .set(data)
      .where(eq(links.id, id))
      .returning();

    revalidatePath("/admin");
    const artist = await getArtistFromLink(id);
    if (artist) {
      revalidatePath(`/subdomain/${artist.slug}`);
    }

    return updatedLink[0];
  }
);

const UpdateLinkOrderPayload = z.array(
  z.object({
    id: z.uuid(),
    order: z.number().int(),
  })
);

export const updateLinkOrder = withErrorHandler(
  async (linksToUpdate: z.infer<typeof UpdateLinkOrderPayload>) => {
    const validation = UpdateLinkOrderPayload.safeParse(linksToUpdate);
    if (!validation.success) {
      throw new BadRequestError(validation.error.message);
    }
    if (validation.data.length === 0) {
      return { success: true }; // Nothing to update
    }

    const artist = await getArtistFromLink(validation.data[0].id);

    // Using a transaction to ensure all updates succeed or fail together
    await db.transaction(async (tx) => {
      for (const link of validation.data) {
        await tx
          .update(links)
          .set({ order: link.order })
          .where(eq(links.id, link.id));
      }
    });

    revalidatePath("/admin");
    if (artist) {
      revalidatePath(`/subdomain/${artist.slug}`);
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
    revalidatePath(`/subdomain/${artist.slug}`);
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
