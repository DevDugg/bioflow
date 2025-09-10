import { getArtistByOwnerId } from "@/server/artists";
import { ThemeView } from "./theme-view";
import { getCurrentUser } from "@/server/auth";
import { Suspense } from "react";
import { ThemeViewSkeleton } from "@/components/ui/theme-view-skeleton";

export default async function ThemesPage() {
  const user = await getCurrentUser();
  if ("errors" in user) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-destructive">{user.errors[0].message}</p>
      </div>
    );
  }

  const artist = await getArtistByOwnerId(user.id);
  if ("errors" in artist) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-destructive">{artist.errors[0].message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Suspense fallback={<ThemeViewSkeleton />}>
        <ThemeView artist={artist} />
      </Suspense>
    </div>
  );
}
