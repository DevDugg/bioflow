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

export interface Click {
  id: string;
  link: {
    label: string;
  };
  geo: {
    country: string;
    city: string;
  };
  timestamp: string;
}

interface RecentClicksTableProps {
  clicks: Click[];
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
              <TableCell className="font-medium">{click.link.label}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {click.geo.city}, {click.geo.country}
                </Badge>
              </TableCell>
              <TableCell>{click.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
