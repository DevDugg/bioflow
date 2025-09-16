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
import { createLink, updateLink } from "@/server/links";
import { toast } from "sonner";
import { linkTypeEnum } from "@/db/schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// import { IconPicker } from "./ui/icon-picker";

function getLabelForSocialLink(url: string): string {
  if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("twitch.tv")) return "Twitch";
  if (url.includes("github.com")) return "GitHub";
  if (url.includes("facebook.com")) return "Facebook";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("spotify.com")) return "Spotify";
  if (url.includes("soundcloud.com")) return "SoundCloud";
  if (url.includes("bandcamp.com")) return "Bandcamp";
  if (url.includes("apple.com")) return "Apple Music";
  if (url.includes("ticketmaster.com")) return "Ticketmaster";
  if (url.includes("eventbrite.com")) return "Eventbrite";
  return "Website";
}

const formSchema = z
  .object({
    label: z.string().optional(),
    url: z.url("Please enter a valid URL."),
    // icon: z.string().optional(),
    badge: z.string().optional(),
    linkType: z.enum(linkTypeEnum.enumValues),
  })
  .refine(
    (data) => {
      if (data.linkType === "link") {
        return !!data.label && data.label.length >= 2;
      }
      return true;
    },
    {
      message: "Label must be at least 2 characters.",
      path: ["label"],
    }
  );

type LinkFormValues = z.infer<typeof formSchema>;

interface LinkFormProps {
  artistId: string;
  initialData?: LinkFormValues & { id: string };
}

export function LinkForm({ artistId, initialData }: LinkFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: initialData?.label ?? "",
      url: initialData?.url ?? "",
      // icon: initialData?.icon ?? "",
      badge: initialData?.badge ?? "",
      linkType: initialData?.linkType ?? "link",
    },
  });

  function onSubmit(values: LinkFormValues) {
    const dataToSend = { ...values };
    if (dataToSend.linkType === "social") {
      dataToSend.label = getLabelForSocialLink(dataToSend.url);
    }

    if (!dataToSend.label) {
      form.setError("label", { message: "Label is required." });
      return;
    }

    // For TypeScript
    const finalLabel = dataToSend.label;

    startTransition(async () => {
      const payload = { ...dataToSend, label: finalLabel };
      if (isEditMode) {
        const result = await updateLink({ id: initialData.id, ...payload });
        if ("errors" in result) {
          toast.error("Error updating link", {
            description: result.errors.map((e: any) => e.message).join(", "),
          });
        } else {
          toast.success("Link updated successfully.");
        }
      } else {
        const result = await createLink({ artistId, ...payload });
        if ("errors" in result) {
          toast.error("Error creating link", {
            description: result.errors.map((e: any) => e.message).join(", "),
          });
        } else {
          toast.success("Link created", {
            description: "Your new link has been saved.",
          });
        }
      }
    });
  }

  const linkType = form.watch("linkType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="linkType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Link Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="link" />
                    </FormControl>
                    <FormLabel className="font-normal">Standard Link</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="social" />
                    </FormControl>
                    <FormLabel className="font-normal">Social Icon</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {linkType === "link" && (
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
        )}
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
        {/* <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <IconPicker
                  value={field.value}
                  onChange={field.onChange}
                  defaultValue={field.value}
                />
              </FormControl>
              <FormDescription>
                Choose an icon to display next to your link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
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
          {isPending
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
            ? "Save Changes"
            : "Create Link"}
        </Button>
      </form>
    </Form>
  );
}
