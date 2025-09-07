import { Sidebar } from "@/components/sidebar";
import { getArtistByHandle } from "@/server/artists";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const artist = await getArtistByHandle("DevDugg");

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2 p-4">
          <Sidebar artist={artist} />
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
