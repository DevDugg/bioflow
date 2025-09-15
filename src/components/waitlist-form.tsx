"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addToWaitlist } from "@/server/waitlist";
import { toast } from "sonner";
import { useFormFeedback } from "@/hooks/use-form-feedback";

const initialState = {
  errors: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? "Joining..." : "Join Waitlist"}
    </Button>
  );
}

export function WaitlistForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addToWaitlist, initialState);

  useFormFeedback(state);

  useEffect(() => {
    if ((state as any)?.message) {
      toast.success((state as any).message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
      <SubmitButton />
    </form>
  );
}
