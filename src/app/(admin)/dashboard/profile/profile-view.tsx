"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { getArtistByHandle } from "@/server/artists";
import { ProfileForm } from "@/components/profile-form";
import { ThemeForm } from "@/components/theme-form";
import { LivePreview } from "@/components/live-preview";
import { useState } from "react";

interface ProfileViewProps {
  artist: Awaited<ReturnType<typeof getArtistByHandle>>;
}

export function ProfileView({ artist }: ProfileViewProps) {
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

  return (
    <div className="grid h-full grid-cols-1 gap-8 p-4 md:grid-cols-2 md:p-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm artist={artist} />
          </CardContent>
        </Card>

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
          <LivePreview artistSlug={artist.slug} theme={theme} />
        </div>
      </div>
    </div>
  );
}
