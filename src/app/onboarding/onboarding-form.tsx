"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { onboardUser } from "@/server/artists";
import { useActionState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores.",
    ),
  avatar: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size < 4 * 1024 * 1024,
      "File must be less than 4MB",
    )
    .refine(
      (file) =>
        !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPG, PNG, and WEBP formats are allowed",
    ),
  description: z.string().optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const initialState = {
  errors: [],
};

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [state, formAction] = useActionState(onboardUser, initialState);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state?.errors?.length > 0) {
      const errorMessage = state.errors[0].message;
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes("username")) {
        setStep(0);
        form.setError("slug", { type: "server", message: errorMessage });
      }
    }
  }, [state]);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: ("name" | "slug")[] = ["name", "slug"];
    if (step === 1) {
      // No validation needed for avatar or description to proceed
    }
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = (data: OnboardingValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("description", data.description || "");
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  const steps = [
    {
      title: "Profile Info",
      fields: ["name", "slug"],
      component: (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="your_username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ),
    },
    {
      title: "Profile Picture",
      fields: ["avatar"],
      component: (
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={preview || undefined} />
                    <AvatarFallback>
                      {form.getValues("name")?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      if (file) {
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
    },
    {
      title: "Bio",
      fields: ["description"],
      component: (
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about yourself"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
    },
  ];

  const progress = (step + 1) / steps.length;

  return (
    <Form {...form}>
      <div className="relative h-1 w-full bg-secondary rounded-full overflow-hidden mb-8">
        <motion.div
          className="absolute h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Step {step + 1} of {steps.length}
      </p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {steps[step].component}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          {step > 0 && (
            <Button type="button" onClick={prevStep} variant="outline">
              Previous
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button type="button" onClick={nextStep} className="ml-auto">
              Next
            </Button>
          )}
          {step === steps.length - 1 && (
            <Button type="submit" disabled={isPending} className="ml-auto">
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
