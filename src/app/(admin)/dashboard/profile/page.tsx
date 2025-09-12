import { getArtistByOwnerId } from "@/server/artists";
import { ProfileView } from "./profile-view";
import { getCurrentUser } from "@/server/auth";
import { Suspense } from "react";
import { ProfileFormSkeleton } from "@/components/ui/profile-form-skeleton";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const artist = await getArtistByOwnerId(user.id);

  if (artist instanceof Response) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-destructive">
          An error occurred while fetching your data.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<ProfileFormSkeleton />}>
      <ProfileView artist={artist} />
    </Suspense>
  );
}
