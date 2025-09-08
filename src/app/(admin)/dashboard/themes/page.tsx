import { getArtistByHandle } from "@/server/artists";
import { ThemeView } from "./theme-view";

export default async function ThemesPage() {
  const artist = await getArtistByHandle("DevDugg");
  return <ThemeView artist={artist} />;
}
