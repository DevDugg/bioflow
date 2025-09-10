import { Sidebar } from "@/components/sidebar";
import { artistExists, getArtistByOwnerId } from "@/server/artists";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "../../../supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("next-url");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const hasArtist = await artistExists(user.id);

  if (!hasArtist && pathname !== "/onboarding") {
    redirect("/onboarding");
  }

  const artist = hasArtist ? await getArtistByOwnerId(user.id) : null;

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="sticky top-0 flex h-full max-h-screen flex-col gap-2 p-4">
          <Sidebar artist={artist} />
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
