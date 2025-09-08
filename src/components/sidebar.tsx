"use client";

import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { getArtistByHandle } from "@/server/artists";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

export function Sidebar({ artist }: { artist: Artist }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard/links",
      label: "Links",
      icon: LinkIcon,
    },
  ];

  if ("errors" in artist) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Could not load artist data.
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-screen flex-col gap-4">
      <Link
        href="/dashboard/profile"
        className={cn(
          "flex items-center gap-3 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-muted",
          pathname === "/dashboard/profile" && "bg-muted"
        )}
      >
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={artist.image ?? undefined} alt={artist.name} />
          <AvatarFallback>
            {artist.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight">{artist.name}</span>
          <span className="text-xs text-muted-foreground">@{artist.slug}</span>
        </div>
      </Link>
      <div className="flex-1">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
