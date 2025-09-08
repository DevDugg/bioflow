"use server";

import { ModelError } from "@/server/errors/model-error";
import { createClient } from "../../supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { withErrorHandler } from "@/server/errors/error-handler";

export const login = withErrorHandler(
  async (formData: FormData): Promise<void> => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ModelError("Could not authenticate user");
    }

    return redirect("/dashboard");
  }
);

export const loginWithGoogle = withErrorHandler(async (): Promise<void> => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    throw new ModelError("Could not authenticate user");
  }

  return redirect(data.url);
});
