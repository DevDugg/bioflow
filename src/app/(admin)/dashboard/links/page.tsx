import { LinksTable } from "@/components/links-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LinkForm } from "@/components/link-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getArtistByOwnerId, artistExists } from "@/server/artists";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default async function AdminPage() {
  const userResult = await getCurrentUser();

  if ("errors" in userResult) {
    redirect("/login");
  }

  const hasArtistResult = await artistExists(userResult.id);

  if (typeof hasArtistResult === "object" && "errors" in hasArtistResult) {
    redirect("/onboarding");
  }

  if (!hasArtistResult) {
    redirect("/onboarding");
  }

  const artistResult = await getArtistByOwnerId(userResult.id);

  if ("errors" in artistResult) {
    redirect("/onboarding");
  }

  const artist = artistResult;

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
          <Dialog>
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
              <LinkForm artistId={artist.id} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton columns={6} rows={3} />}>
            <LinksTable artist={artist} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
