import { getArtistByHandle } from "@/server/artists";
import { notFound } from "next/navigation";
import { ArtistProfile } from "@/components/artist-profile";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/ui/profile-skeleton";
import type { Metadata } from "next";

type Props = {
  params: { handle: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const result = await getArtistByHandle(handle);

  if ("errors" in result) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `${result.name} | Bioflow`,
    description: result.description,
  };
}

export default async function ArtistPage({ params }: Props) {
  const { handle } = await params;
  const result = await getArtistByHandle(handle);

  if ("errors" in result) {
    if (result.errors.some((e: any) => e?.message === "Not Found")) {
      notFound();
    }
    return (
      <main className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            {result.errors.map((e: any) => e?.message).join(", ")}
          </p>
        </div>
      </main>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const profileUrl = `${siteUrl}/${result.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: result.name,
    url: profileUrl,
    image: result.image,
    description: result.description,
    sameAs: result.links.map((link) => link.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
