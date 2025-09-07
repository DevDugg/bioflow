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
import { GripVertical, MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useTransition } from "react";
import { deleteLink, updateLinkOrder } from "@/server/links";
import { toast } from "sonner";
import { LinkForm } from "./link-form";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;
type Link = Artist extends { links: Array<any> }
  ? Artist["links"][number]
  : never;

interface LinksTableProps {
  artist: Artist;
  onLinkUpdated: () => void;
}

function SortableRow({
  link,
  children,
}: {
  link: Link;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell className="cursor-grab" {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </TableCell>
      {children}
    </TableRow>
  );
}

export function LinksTable({ artist, onLinkUpdated }: LinksTableProps) {
  const [isPending, startTransition] = useTransition();
  const [linkToDelete, setLinkToDelete] = useState<Link | null>(null);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const [orderedLinks, setOrderedLinks] = useState<Link[]>([]);

  useEffect(() => {
    if (artist && "links" in artist) {
      setOrderedLinks(artist.links ?? []);
    }
  }, [artist]);

  if (artist.errors) {
    return <p>An unexpected error occurred.</p>;
  }

  const handleDelete = () => {
    if (!linkToDelete) return;
    startTransition(async () => {
      const result = await deleteLink(linkToDelete.id);
      if ("errors" in result) {
        toast.error("Error deleting link", {
          description: result.errors.map((e: any) => e.message).join(", "),
        });
      } else {
        toast.success("Link deleted successfully.");
        setLinkToDelete(null);
        onLinkUpdated(); // Refresh data on parent
      }
    });
  };

  const handleEditSuccess = () => {
    setLinkToEdit(null);
    onLinkUpdated();
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedLinks.findIndex((link) => link.id === active.id);
      const newIndex = orderedLinks.findIndex((link) => link.id === over.id);

      const newOrder = arrayMove(orderedLinks, oldIndex, newIndex);
      setOrderedLinks(newOrder);

      const linksToUpdate = newOrder.map((link, index) => ({
        id: link.id,
        order: index,
      }));

      startTransition(async () => {
        const result = await updateLinkOrder(linksToUpdate);
        if ("errors" in result) {
          toast.error("Failed to update link order.");
          // Revert optimistic update
          if (artist && "links" in artist) {
            setOrderedLinks(artist.links ?? []);
          }
        } else {
          toast.success("Link order updated.");
          onLinkUpdated();
        }
      });
    }
  };

  return (
    <>
      <div className="rounded-lg border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={orderedLinks.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedLinks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No links yet. Create one to get started!
                    </TableCell>
                  </TableRow>
                )}
                {orderedLinks.map((link: Link) => (
                  <SortableRow key={link.id} link={link}>
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
                      {link.icon && (
                        <Badge variant="outline">{link.icon}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {link.badge && (
                        <Badge variant="secondary">{link.badge}</Badge>
                      )}
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
                          <DropdownMenuItem onClick={() => setLinkToEdit(link)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setLinkToDelete(link)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </SortableRow>
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!linkToEdit}
        onOpenChange={(open) => !open && setLinkToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit link</DialogTitle>
          </DialogHeader>
          <LinkForm
            artistId={artist && "id" in artist ? (artist.id as string) : ""}
            initialData={linkToEdit ?? undefined}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!linkToDelete}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
