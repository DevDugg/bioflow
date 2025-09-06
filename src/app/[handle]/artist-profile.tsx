"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

// This is a simplified type for the mock data, no need to import the full object
type Artist = {
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  links: {
    title: string;
    url: string;
    icon: React.ReactNode;
  }[];
};

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function ArtistProfile({ artist }: { artist: Artist }) {
  return (
    <motion.div
      className="w-full max-w-lg"
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.15,
          },
        },
      }}
    >
      <motion.section
        variants={FADE_UP_ANIMATION_VARIANTS}
        className="flex flex-col items-center text-center"
      >
        <Avatar className="size-28 border-4 border-background shadow-lg">
          <AvatarImage src={artist.avatarUrl} alt={artist.name} />
          <AvatarFallback>
            {artist.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          {artist.name}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">@{artist.handle}</p>
        <p className="mt-6 max-w-md text-foreground/80">{artist.bio}</p>
      </motion.section>

      <motion.section
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="mt-10 flex w-full flex-col space-y-4"
      >
        {artist.links.map((link) => (
          <motion.div key={link.title} variants={FADE_UP_ANIMATION_VARIANTS}>
            <Button
              asChild
              variant="outline"
              className="h-16 w-full transform bg-background/50 text-lg shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out hover:scale-[1.03] hover:border-primary/50 hover:bg-primary/10"
            >
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                {link.icon}
                {link.title}
              </Link>
            </Button>
          </motion.div>
        ))}
      </motion.section>
    </motion.div>
  );
}
