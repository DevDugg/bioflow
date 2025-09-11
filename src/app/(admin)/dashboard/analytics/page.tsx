import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ExportButton } from "@/components/ui/export-button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { getAnalytics, getFilterValues } from "@/server/analytics";
import { format } from "date-fns";
import { Suspense } from "react";

export type ClickType = Awaited<ReturnType<typeof getAnalytics>>;

async function AnalyticsTable({
  searchParams,
}: {
  searchParams: {
    from?: string;
    to?: string;
    country?: string;
    device?: string;
    ref?: string;
  };
}) {
  const { from, to, country, device, ref } = await searchParams;
  const data = await getAnalytics({ from, to, country, device, ref });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Link</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Referrer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {"errors" in data || data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No data to display.
            </TableCell>
          </TableRow>
        ) : (
          data.map((click) => (
            <TableRow key={click.id}>
              <TableCell>{click.link?.label ?? "N/A"}</TableCell>
              <TableCell>{format(new Date(click.ts), "LLL dd, y")}</TableCell>
              <TableCell>{click.country ?? "N/A"}</TableCell>
              <TableCell>{click.device ?? "N/A"}</TableCell>
              <TableCell>{click.ref ?? "N/A"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: {
    from?: string;
    to?: string;
    country?: string;
    device?: string;
    ref?: string;
  };
}) {
  const filterValues = await getFilterValues();

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed analytics for your links.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DateRangePicker />
              <FilterDropdown filterValues={filterValues} />
              <ExportButton />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton columns={5} />}>
            <AnalyticsTable searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
