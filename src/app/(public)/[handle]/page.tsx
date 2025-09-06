import { Music, Twitter, Instagram, Globe, Youtube, Mic2 } from "lucide-react";
import { ArtistProfile } from "./artist-profile";

export const MOCK_ARTIST = {
  name: "Melody Bloom",
  handle: "melodybloom",
  avatarUrl: "https://i.pravatar.cc/150?u=melodybloom",
  bio: "Indie artist crafting dreamy soundscapes. Listen to my latest single 'Ocean Eyes' now!",
  links: [
    {
      title: "Listen on Spotify",
      url: "#",
      icon: <Music className="mr-2 h-4 w-4" />,
    },
    {
      title: "Listen on Apple Music",
      url: "#",
      icon: <Music className="mr-2 h-4 w-4" />,
    },
    {
      title: "Official Website",
      url: "#",
      icon: <Globe className="mr-2 h-4 w-4" />,
    },
    {
      title: "Follow on Twitter",
      url: "#",
      icon: <Twitter className="mr-2 h-4 w-4" />,
    },
    {
      title: "Follow on Instagram",
      url: "#",
      icon: <Instagram className="mr-2 h-4 w-4" />,
    },
    {
      title: "Watch on YouTube",
      url: "#",
      icon: <Youtube className="mr-2 h-4 w-4" />,
    },
    {
      title: "Upcoming Tour Dates",
      url: "#",
      icon: <Mic2 className="mr-2 h-4 w-4" />,
    },
  ],
};

export default function ArtistPage({ params }: { params: { handle: string } }) {
  const artist = MOCK_ARTIST;

  return (
    <main className="flex justify-center items-center flex-col gap-4 p-4 md:gap-8 md:p-8">
      <ArtistProfile artist={artist} />
    </main>
  );
}
