"use client";

import { Button } from "@/components/ui/button";
import { exportAnalytics } from "@/server/analytics";
import { FileDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function ExportButton() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const handleExport = () => {
    startTransition(async () => {
      const params = Object.fromEntries(searchParams.entries());
      const result = await exportAnalytics(params);

      if (typeof result !== "string") {
        toast.error("Failed to export analytics.");
        return;
      }

      if (result.length === 0) {
        toast.info("No data to export.");
        return;
      }

      const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "analytics.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export complete!");
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1"
      onClick={handleExport}
      disabled={isPending}
    >
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        {isPending ? "Exporting..." : "Export"}
      </span>
    </Button>
  );
}
