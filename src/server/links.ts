"use server";

import { db } from "@/db/client";
import { links } from "@/db/schemas";
import { withErrorHandler } from "@/server/errors/error-handler";
import { revalidatePath } from "next/cache";

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

    return newLink[0];
  }
);
