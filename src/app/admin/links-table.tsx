"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getArtistByHandle } from "@/server/artists";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;
type Link = Artist extends { links: Array<any> }
  ? Artist["links"][number]
  : never;

export function LinksTable({ artist }: { artist: Artist }) {
  if (artist.errors) {
    return <p>An unexpected error occurred.</p>;
  }

  const links = artist.links ?? [];

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Order</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead className="w-[50px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No links yet. Create one to get started!
              </TableCell>
            </TableRow>
          )}
          {links.map((link: Link) => (
            <TableRow key={link.id}>
              <TableCell>{link.order}</TableCell>
              <TableCell className="font-medium">{link.label}</TableCell>
              <TableCell>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.url}
                </a>
              </TableCell>
              <TableCell>
                {link.icon && <Badge variant="outline">{link.icon}</Badge>}
              </TableCell>
              <TableCell>
                {link.badge && <Badge variant="secondary">{link.badge}</Badge>}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
