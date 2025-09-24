"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { memo, useEffect, useState, useTransition } from "react";
import { HexColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { getArtistByHandle } from "@/server/artists";
import { updateArtistTheme } from "@/server/artists";

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

const cssVarMap: Record<keyof ThemeFormValues, string> = {
  background: "--background",
  foreground: "--foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
};

function ThemeFormComponent({
  artist,
  onThemeChange,
}: Omit<ThemeFormProps, "artist"> & {
  artist: Exclude<Artist, { errors: unknown }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [defaultTheme, setDefaultTheme] = useState<ThemeFormValues | null>(
    null
  );

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const theme = themeColors.reduce((acc, key) => {
      acc[key] = style.getPropertyValue(cssVarMap[key]).trim();
      return acc;
    }, {} as ThemeFormValues);
    setDefaultTheme(theme);
  }, []);

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      background: "",
      foreground: "",
      primary: "",
      primaryForeground: "",
    },
  });

  useEffect(() => {
    if (defaultTheme) {
      form.reset({
        background: artist.theme?.background || defaultTheme.background,
        foreground: artist.theme?.foreground || defaultTheme.foreground,
        primary: artist.theme?.primary || defaultTheme.primary,
        primaryForeground:
          artist.theme?.primaryForeground || defaultTheme.primaryForeground,
      });
    }
  }, [defaultTheme, artist.theme, form]);

  const watchedTheme = form.watch();
  useEffect(() => {
    onThemeChange(watchedTheme);
  }, [watchedTheme, onThemeChange]);

  function onSubmit(values: ThemeFormValues) {
    startTransition(async () => {
      const result = await updateArtistTheme({ id: artist.id, theme: values });
      if ("errors" in result) {
        toast.error("Error updating theme", {
          description: result.errors
            .map((e: { message: string }) => e.message)
            .join(", "),
        });
      } else {
        toast.success("Theme updated successfully.");
      }
    });
  }

  const handleReset = () => {
    if (defaultTheme) {
      form.reset(defaultTheme);
      startTransition(async () => {
        const result = await updateArtistTheme({
          id: artist.id,
          theme: defaultTheme,
        });
        if ("errors" in result) {
          toast.error("Error resetting theme", {
            description: result.errors
              .map((e: { message: string }) => e.message)
              .join(", "),
          });
        } else {
          toast.info("Theme reset to default.");
        }
      });
    }
  };

  if (!defaultTheme) {
    return null; // or a loading skeleton
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate from Album Art</CardTitle>
            <CardDescription>
              Upload your album art to automatically generate a color palette.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <FormItem>
              <FormLabel>Album Art</FormLabel>
              <FormControl>
                <Input type="file" className="max-w-xs" />
              </FormControl>
            </FormItem>
            <Button type="button">Generate</Button>
          </CardContent>
        </Card>
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
                          onChange={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormControl>
                      <div className="relative w-full">
                        <Input placeholder={defaultTheme[key]} {...field} />
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
}

export const ThemeForm = memo(function ThemeForm({
  artist,
  onThemeChange,
}: ThemeFormProps) {
  if ("errors" in artist) {
    return null;
  }
  return <ThemeFormComponent artist={artist} onThemeChange={onThemeChange} />;
});
