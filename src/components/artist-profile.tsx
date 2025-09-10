"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  type LucideIcon,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Mic2,
  Music,
  Link as LinkIcon,
} from "lucide-react";
import type { getArtistByHandle } from "@/server/artists";
import { Badge } from "@/components/ui/badge";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;
type LinkType = Artist extends { links: Array<any> }
  ? Artist["links"][number]
  : never;

const iconMap: Record<string, LucideIcon> = {
  globe: Globe,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  mic2: Mic2,
  music: Music,
  link: LinkIcon,
};

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function ArtistProfile({ artist }: { artist: Artist }) {
  if (!artist || "errors" in artist) {
    return null;
  }

  const themeStyle = {
    "--background": artist.theme?.background,
    "--foreground": artist.theme?.foreground,
    "--primary": artist.theme?.primary,
    "--primary-foreground": artist.theme?.primaryForeground,
  } as React.CSSProperties;

  return (
    <motion.div
      className="w-full max-w-lg"
      style={themeStyle}
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
        <Avatar className="size-28 border-2 border-border shadow-lg">
          <AvatarImage src={artist.image ?? undefined} alt={artist.name} />
          <AvatarFallback>
            {artist.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-h1 font-extrabold tracking-tight text-foreground">
          {artist.name}
        </h1>
        <p className="mt-1 text-body text-muted-foreground">@{artist.slug}</p>
        {artist.description && (
          <p className="mt-6 max-w-md text-small text-foreground/80">
            {artist.description}
          </p>
        )}
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
        {artist.links.map((link: LinkType) => {
          const Icon = link.icon ? (iconMap[link.icon] ?? LinkIcon) : LinkIcon;
          return (
            <motion.div key={link.id} variants={FADE_UP_ANIMATION_VARIANTS}>
              <Button
                asChild
                variant="default"
                className="h-16 w-full text-base"
              >
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="truncate">{link.label}</span>
                  {link.badge && (
                    <Badge className="ml-2" variant="secondary">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </motion.section>
    </motion.div>
  );
}
