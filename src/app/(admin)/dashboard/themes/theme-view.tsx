"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { getArtistByHandle } from "@/server/artists";
import { ThemeForm } from "@/components/theme-form";
import { ArtistProfile } from "@/components/artist-profile";
import { useState } from "react";

interface ThemeViewProps {
  artist: Awaited<ReturnType<typeof getArtistByHandle>>;
}

export function ThemeView({ artist }: ThemeViewProps) {
  const [theme, setTheme] = useState(
    "errors" in artist ? {} : artist.theme ?? {}
  );

  if ("errors" in artist) {
    return (
      <div className="flex h-full items-center justify-center p-4 md:p-8">
        <p className="text-muted-foreground">
          Could not load artist data. Please try again.
        </p>
      </div>
    );
  }

  const liveArtist = {
    ...artist,
    theme,
  };

  return (
    <div className="grid h-full grid-cols-1 gap-8 p-4 md:grid-cols-2 md:p-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Customize the look and feel of your public page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeForm artist={artist} onThemeChange={setTheme} />
          </CardContent>
        </Card>
      </div>
      <div className="hidden md:block">
        <div className="sticky top-8">
          <div
            className="rounded-lg border p-4 flex justify-center"
            style={{
              backgroundColor: theme?.background ?? "var(--background)",
            }}
          >
            <ArtistProfile artist={liveArtist} />
          </div>
        </div>
      </div>
    </div>
  );
}
