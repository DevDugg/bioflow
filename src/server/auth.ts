"use server";

import { ModelError } from "@/server/errors/model-error";
import { createClient } from "../../supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { withErrorHandler } from "@/server/errors/error-handler";
import { UnauthorizedError } from "./errors/unauthorized-error";
import { withFormErrorHandler } from "./errors/form-error-handler";

export const getCurrentUser = withErrorHandler(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
});

export const logout = withErrorHandler(async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
});

export const login = withFormErrorHandler(
  async (prevState: any, formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ModelError(error.message);
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
    throw new ModelError(error.message);
  }

  return redirect(data.url);
});

export const signup = withFormErrorHandler(
  async (prevState: any, formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${(await headers()).get("origin")}/auth/confirm`,
      },
    });

    if (error) {
      throw new ModelError(error.message);
    }

    return redirect("/confirm-email");
  }
);
