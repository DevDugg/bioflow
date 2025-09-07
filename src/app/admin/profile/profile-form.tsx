"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { updateArtist } from "@/server/artists";
import { toast } from "sonner";
import type { getArtistByHandle } from "@/server/artists";
import { Textarea } from "@/components/ui/textarea";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  artist: Artist;
}

export function ProfileForm({ artist }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  if ("errors" in artist) {
    return null;
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: artist.name ?? "",
      slug: artist.slug ?? "",
      description: artist.description ?? "",
    },
  });

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const result = await updateArtist({ id: artist.id, ...values });
      if ("errors" in result) {
        toast.error("Error updating profile", {
          description: result.errors.map((e: any) => e.message).join(", "),
        });
      } else {
        toast.success("Profile updated successfully.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your artist name" {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed on your public page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="your-artist-slug" {...field} />
              </FormControl>
              <FormDescription>
                This will be your unique URL. E.g., bioflow.com/your-artist-slug
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell your fans a little about yourself"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A short description about you or your work.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
