"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { memo, useEffect, useTransition } from "react";
import { toast } from "sonner";
import type { getArtistByHandle } from "@/server/artists";
import { updateArtistTheme } from "@/server/artists";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

const formSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  card: z.string(),
  cardForeground: z.string(),
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
});

type ThemeFormValues = z.infer<typeof formSchema>;

interface ThemeFormProps {
  artist: Artist;
  onThemeChange: (theme: ThemeFormValues) => void;
}

export const ThemeForm = memo(function ThemeForm({
  artist,
  onThemeChange,
}: ThemeFormProps) {
  const [isPending, startTransition] = useTransition();

  if ("errors" in artist) {
    return null;
  }

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      background: artist.theme?.background ?? "",
      foreground: artist.theme?.foreground ?? "",
      card: artist.theme?.card ?? "",
      cardForeground: artist.theme?.cardForeground ?? "",
      primary: artist.theme?.primary ?? "",
      primaryForeground: artist.theme?.primaryForeground ?? "",
      secondary: artist.theme?.secondary ?? "",
      secondaryForeground: artist.theme?.secondaryForeground ?? "",
      accent: artist.theme?.accent ?? "",
      accentForeground: artist.theme?.accentForeground ?? "",
    },
  });

  const watchedTheme = form.watch();
  useEffect(() => {
    onThemeChange(watchedTheme);
  }, [watchedTheme, onThemeChange]);

  function onSubmit(values: ThemeFormValues) {
    startTransition(async () => {
      const result = await updateArtistTheme({ id: artist.id, theme: values });
      if ("errors" in result) {
        toast.error("Error updating theme", {
          description: result.errors.map((e: any) => e.message).join(", "),
        });
      } else {
        toast.success("Theme updated successfully.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Object.keys(form.getValues()).map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key as keyof ThemeFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-md border"
                      style={{
                        backgroundColor: form.watch(
                          key as keyof ThemeFormValues
                        ),
                      }}
                    />
                    <FormControl>
                      <Input placeholder="oklch(...)" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Theme"}
        </Button>
      </form>
    </Form>
  );
});
