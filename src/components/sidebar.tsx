"use client";

import { Button } from "@/components/ui/button";
import { AreaChart, Home, LinkIcon, Palette, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { getArtistByHandle } from "@/server/artists";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logout } from "@/server/auth";
import { LogOut } from "lucide-react";
import { Separator } from "./ui/separator";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

export function Sidebar({ artist }: { artist: Artist }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: Home,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: AreaChart,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/dashboard/links",
      label: "Links",
      icon: LinkIcon,
    },

    {
      href: "/dashboard/themes",
      label: "Themes",
      icon: Palette,
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
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg p-2 text-sm font-medium"
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
      </div>
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
      <div>
        <Separator />
        <form action={logout as any} className="mt-4">
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}
