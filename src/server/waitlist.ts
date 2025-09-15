"use server";

import { withFormActionErrorHandler } from "./errors/form-action-error-handler";
import { z } from "zod";
import { db } from "@/db/client";
import { waitlist } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { ModelError } from "./errors/model-error";

const WaitlistSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

export const addToWaitlist = withFormActionErrorHandler(
  async (prevState: any, formData: FormData) => {
    const validatedFields = WaitlistSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validatedFields.success) {
      throw new ModelError(
        validatedFields.error.flatten().fieldErrors.email?.[0] ||
          "Invalid email provided."
      );
    }

    const { email } = validatedFields.data;

    const existingEntry = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, email),
    });

    if (existingEntry) {
      throw new ModelError("This email is already on the waitlist. Thank you!");
    }

    await db.insert(waitlist).values({
      email,
    });

    return {
      message: "Thank you for joining the waitlist!",
    };
  }
);
