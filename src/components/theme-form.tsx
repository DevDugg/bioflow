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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { XIcon } from "lucide-react";

type Artist = Awaited<ReturnType<typeof getArtistByHandle>>;

const formSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  primary: z.string(),
  primaryForeground: z.string(),
});

type ThemeFormValues = z.infer<typeof formSchema>;

interface ThemeFormProps {
  artist: Artist;
  onThemeChange: (theme: ThemeFormValues) => void;
}

const themeColors: (keyof ThemeFormValues)[] = [
  "background",
  "foreground",
  "primary",
  "primaryForeground",
];

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
      primary: artist.theme?.primary ?? "",
      primaryForeground: artist.theme?.primaryForeground ?? "",
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

  const handleReset = () => {
    form.reset({
      background: "",
      foreground: "",
      primary: "",
      primaryForeground: "",
    });
    toast.info("Theme reset to default.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {themeColors.map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-10 p-0"
                          style={{ backgroundColor: field.value }}
                        />
                      </PopoverTrigger>
                      <PopoverContent>
                        <HexColorPicker
                          color={field.value || ""}
                          onChange={(color) => field.onChange(color)}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormControl>
                      <div className="relative w-full">
                        <Input placeholder="" {...field} />
                        {field.value && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => form.setValue(key, "")}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Theme"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
          >
            Reset to Default
          </Button>
        </div>
      </form>
    </Form>
  );
});
