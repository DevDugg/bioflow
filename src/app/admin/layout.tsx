import { Sidebar } from "./sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2 p-4">
          <Sidebar />
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
