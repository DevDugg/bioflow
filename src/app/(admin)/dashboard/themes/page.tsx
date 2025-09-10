import { getArtistByOwnerId } from "@/server/artists";
import { ThemeView } from "./theme-view";
import { getCurrentUser } from "@/server/auth";

export default async function ThemesPage() {
  const user = await getCurrentUser();
  const artist = await getArtistByOwnerId(user.id);
  return <ThemeView artist={artist} />;
}
