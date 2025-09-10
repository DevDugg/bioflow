import { getArtistByOwnerId } from "@/server/artists";
import { ProfileView } from "./profile-view";
import { getCurrentUser } from "@/server/auth";
import { Suspense } from "react";
import { ProfileFormSkeleton } from "@/components/ui/profile-form-skeleton";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const artist = await getArtistByOwnerId(user.id);
  return (
    <Suspense fallback={<ProfileFormSkeleton />}>
      <ProfileView artist={artist} />
    </Suspense>
  );
}
