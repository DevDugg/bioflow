"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/server/auth";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useFormFeedback } from "@/hooks/use-form-feedback";

const initialState = {
  errors: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  useFormFeedback(state);

  return (
    <>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" name="password" required />
        </div>
        <SubmitButton />
      </form>
      {/* <div className="my-4 flex items-center">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-xs text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>
      <form action={loginWithGoogle}>
        <Button variant="outline" className="w-full" type="submit">
          <ChromeIcon className="mr-2 h-4 w-4" />
          Sign in with Google
        </Button>
      </form> */}
    </>
  );
}
