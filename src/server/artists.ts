"use server";

import { db } from "@/db/client";
import { artists } from "@/db/schemas/artists";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "./errors/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import { z } from "zod";
import { BadRequestError } from "./errors/bad-request-error";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { ModelError } from "./errors/model-error";
import { createClient } from "../../supabase/server";
import { owners } from "@/db/schemas/owners";
import { redirect } from "next/navigation";

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

export const getArtistByOwnerId = withErrorHandler(async (userId: string) => {
  const artist = await db.query.artists.findFirst({
    where: eq(artists.ownerId, userId),
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

export const artistExists = withErrorHandler(async (userId: string) => {
  const result = await db
    .select({
      id: artists.id,
    })
    .from(artists)
    .where(eq(artists.ownerId, userId));

  return result.length > 0;
});

export const onboardUser = withErrorHandler(
  async (prevState: any, formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      avatar: formData.get("avatar") as File,
    };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new ModelError("User not found");
    }

    const existingArtist = await db.query.artists.findFirst({
      where: eq(artists.slug, data.slug),
    });

    if (existingArtist) {
      throw new ModelError("Username is already in use.");
    }

    let newImageUrl: string | undefined = undefined;
    if (data.avatar && data.avatar.size > 0) {
      const supabaseAdmin = createSupabaseAdminClient();
      const filePath = `${user.id}/${Date.now()}-${data.avatar.name}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(filePath, data.avatar);

      if (uploadError) {
        throw new ModelError(uploadError.message);
      }

      const { data: publicUrl } = supabaseAdmin.storage
        .from("avatars")
        .getPublicUrl(filePath);
      newImageUrl = publicUrl.publicUrl;
    }

    await db.transaction(async (tx) => {
      await tx.insert(owners).values({
        id: user.id,
        name: data.name,
      });
      await tx.insert(artists).values({
        ownerId: user.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: newImageUrl,
      });
    });

    return redirect("/dashboard");
  }
);

const UpdateArtistPayload = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  avatar: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size < 4 * 1024 * 1024,
      "File must be less than 4MB"
    )
    .refine(
      (file) =>
        !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPG, PNG, and WEBP formats are allowed"
    ),
});

export const updateArtist = withErrorHandler(async (payload: FormData) => {
  const values = Object.fromEntries(payload.entries());
  const validation = UpdateArtistPayload.safeParse(values);

  if (!validation.success) {
    throw new BadRequestError(validation.error.message);
  }

  const { id, avatar, ...data } = validation.data;
  let newImageUrl = undefined;

  if (avatar && avatar.size > 0) {
    const supabase = createSupabaseAdminClient();
    const filePath = `${id}/${Date.now()}-${avatar.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatar);

    if (uploadError) {
      throw new ModelError(uploadError.message);
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    newImageUrl = publicUrl.publicUrl;
  }

  const updatedArtist = await db
    .update(artists)
    .set({
      ...data,
      ...(newImageUrl && { image: newImageUrl }),
    })
    .where(eq(artists.id, id))
    .returning();

  revalidatePath("/admin/profile");
  revalidatePath(`/${updatedArtist[0].slug}`);

  return updatedArtist[0];
});

const UpdateArtistThemePayload = z.object({
  id: z.uuid(),
  theme: z.object({
    background: z.string().optional(),
    foreground: z.string().optional(),
    card: z.string().optional(),
    cardForeground: z.string().optional(),
    primary: z.string().optional(),
    primaryForeground: z.string().optional(),
    secondary: z.string().optional(),
    secondaryForeground: z.string().optional(),
    accent: z.string().optional(),
    accentForeground: z.string().optional(),
  }),
});

export const updateArtistTheme = withErrorHandler(
  async (payload: z.infer<typeof UpdateArtistThemePayload>) => {
    const validation = UpdateArtistThemePayload.safeParse(payload);
    if (!validation.success) {
      throw new BadRequestError(validation.error.message);
    }
    const { id, theme } = validation.data;

    const updatedArtist = await db
      .update(artists)
      .set({ theme })
      .where(eq(artists.id, id))
      .returning();

    revalidatePath("/admin/profile");
    revalidatePath(`/${updatedArtist[0].slug}`);

    return updatedArtist[0];
  }
);
