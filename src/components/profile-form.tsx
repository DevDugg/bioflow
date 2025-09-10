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
import { useEffect, useRef, useState, useTransition } from "react";
import { updateArtist } from "@/server/artists";
import { toast } from "sonner";
import type { getArtistByHandle } from "@/server/artists";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  artist: Artist;
}

export function ProfileForm({ artist }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "errors" in artist ? "" : (artist.name ?? ""),
      slug: "errors" in artist ? "" : (artist.slug ?? ""),
      description: "errors" in artist ? "" : (artist.description ?? ""),
      avatar: undefined,
    },
  });

  if ("errors" in artist) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load artist data. Please try again.
      </p>
    );
  }

  const currentAvatar = avatarPreview ?? artist.image;

  useEffect(() => {
    // Clean up the object URL when the component unmounts
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function onSubmit(values: ProfileFormValues) {
    const formData = new FormData();
    formData.append("id", artist.id);
    formData.append("name", values.name);
    formData.append("slug", values.slug);
    formData.append("description", values.description ?? "");
    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }

    startTransition(async () => {
      const result = await updateArtist(formData);
      if ("errors" in result) {
        toast.error("Error updating profile", {
          description: result.errors.map((e: any) => e.message).join(", "),
        });
      } else {
        toast.success("Profile updated successfully.");
        setAvatarPreview(null); // Clear preview to show new persisted avatar
        if (avatarFileRef.current) {
          avatarFileRef.current.value = ""; // Reset file input
        }
      }
    });
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-8">
        <div>
          <label
            htmlFor="avatar-upload"
            className="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full"
          >
            <Avatar className="h-24 w-24 border-2 transition-opacity group-hover:opacity-50">
              <AvatarImage src={currentAvatar ?? undefined} alt={artist.name} />
              <AvatarFallback>
                {artist.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-sm text-white">Change</span>
            </div>
          </label>
          <input
            ref={avatarFileRef}
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleAvatarChange}
            disabled={isPending}
          />
        </div>
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
                  This will be your unique URL. E.g.,
                  bioflow.com/your-artist-slug
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
      </div>
    </Form>
  );
}
