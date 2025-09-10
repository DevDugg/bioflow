"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Click = {
  id: string;
  link: {
    label: string;
  } | null;
  country: string | null;
  ts: string;
};

interface RecentClicksTableProps {
  clicks: Click[];
}

function getRelativeTime(timestamp: string) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function RecentClicksTable({ clicks }: RecentClicksTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Link</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clicks.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No recent clicks.
              </TableCell>
            </TableRow>
          )}
          {clicks.map((click) => (
            <TableRow key={click.id}>
              <TableCell className="font-medium">
                {click.link?.label ?? "N/A"}
              </TableCell>
              <TableCell>
                {click.country && (
                  <Badge variant="outline">{click.country}</Badge>
                )}
              </TableCell>
              <TableCell>{getRelativeTime(click.ts)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
