"use client";

import { getArtistByHandle } from "@/server/artists";
import { LinksTable } from "./links-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LinkForm } from "./link-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

export default function AdminPage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    // Hardcoded for now, will be replaced with authenticated user
    const result = await getArtistByHandle("melodybloom");
    if ("errors" in result) {
      setError("Could not load artist data. Please try again later.");
    } else {
      setArtist(result);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    setCreateDialogOpen(false);
    fetchData();
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 md:p-8">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!artist) {
    // TODO: Add a proper loading skeleton
    return (
      <div className="flex h-full items-center justify-center p-4 md:p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Links</CardTitle>
            <CardDescription className="mt-1">
              Manage your public links.
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new link</DialogTitle>
              </DialogHeader>
              <LinkForm artistId={artist.id} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <LinksTable artist={artist} onLinkUpdated={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
