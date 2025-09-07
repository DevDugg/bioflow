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
import { createLink } from "@/server/links";
import { toast } from "sonner";

const formSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters."),
  url: z.string().url("Please enter a valid URL."),
  icon: z.string().optional(),
  badge: z.string().optional(),
});

type LinkFormValues = z.infer<typeof formSchema>;

interface LinkFormProps {
  artistId: string;
  onSuccess?: () => void;
}

export function LinkForm({ artistId, onSuccess }: LinkFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      url: "",
      icon: "",
      badge: "",
    },
  });

  function onSubmit(values: LinkFormValues) {
    startTransition(async () => {
      const result = await createLink({ artistId, ...values });
      if ("errors" in result) {
        toast.error("Error creating link", {
          description: result.errors.map((e: any) => e.message).join(", "),
        });
      } else {
        toast.success("Link created", {
          description: "Your new link has been saved.",
        });
        onSuccess?.();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="My latest single" {...field} />
              </FormControl>
              <FormDescription>
                The text that will be displayed on the button.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://open.spotify.com/..." {...field} />
              </FormControl>
              <FormDescription>The destination URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="music" {...field} />
              </FormControl>
              <FormDescription>
                A{" "}
                <a
                  href="https://lucide.dev/icons/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Lucide icon
                </a>{" "}
                name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="New!" {...field} />
              </FormControl>
              <FormDescription>
                A small badge to display next to the label.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Link"}
        </Button>
      </form>
    </Form>
  );
}
