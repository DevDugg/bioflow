import { getArtistByHandle } from "@/server/artists";
import { notFound } from "next/navigation";
import { ArtistProfile } from "@/components/artist-profile";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/ui/profile-skeleton";
import type { Metadata } from "next";
import { generateSeo } from "@/lib/seo";

type Props = {
  params: { handle: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const result = await getArtistByHandle(handle);

  if (!result || result instanceof Response) {
    return {
      title: "Not Found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const profileUrl = `${siteUrl}/${result.slug}`;

  const { metadata } = generateSeo({
    title: result.name,
    description: result.description ?? undefined,
    url: profileUrl,
    links: result.links,
    handle: result.slug,
  });

  return metadata;
}

export default async function ArtistPage({ params }: Props) {
  const { handle } = await params;
  const result = await getArtistByHandle(handle);

  if (result instanceof Response) {
    return notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const profileUrl = `${siteUrl}/${result.slug}`;

  const { jsonLd } = generateSeo({
    title: result.name,
    description: result.description ?? undefined,
    url: profileUrl,
    links: result.links,
    handle: result.slug,
  });

  return (
    <>
      {jsonLd}
      <style>{`
        body {
          background-color: ${result.theme?.background ?? "var(--background)"};
        }
      `}</style>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <Suspense fallback={<ProfileSkeleton />}>
          <ArtistProfile artist={result} />
        </Suspense>
      </main>
    </>
  );
}
