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

interface ProfileViewProps {
  artist: Awaited<ReturnType<typeof getArtistByHandle>>;
}

export function ProfileView({ artist }: ProfileViewProps) {
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
    <div className="p-4 md:p-8">
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
    </div>
  );
}
