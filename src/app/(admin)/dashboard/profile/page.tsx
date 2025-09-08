import { getArtistByHandle } from "@/server/artists";
import { ProfileView } from "./profile-view";

export default async function ProfilePage() {
  const artist = await getArtistByHandle("DevDugg");
  return <ProfileView artist={artist} />;
}
