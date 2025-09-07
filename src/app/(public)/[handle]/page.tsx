import { ArtistProfile } from "./artist-profile";
import { getArtistByHandle } from "@/server/artists";
import { notFound } from "next/navigation";

export default async function ArtistPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = await params;
  const result = await getArtistByHandle(handle);

  if ("errors" in result) {
    // This can be replaced with a custom error component
    if (result.errors.some((e: any) => e?.message === "Artist not found")) {
      notFound();
    }
    return (
      <main className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            {result.errors.map((e: any) => e?.message).join(", ")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center flex-col gap-4 p-4 md:gap-8 md:p-8">
      <ArtistProfile artist={result} />
    </main>
  );
}
