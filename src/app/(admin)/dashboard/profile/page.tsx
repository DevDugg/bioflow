import { getArtistByOwnerId } from "@/server/artists";
import { ProfileView } from "./profile-view";
import { getCurrentUser } from "@/server/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const artist = await getArtistByOwnerId(user.id);
  return <ProfileView artist={artist} />;
}
