import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { BadRequestError } from "./bad-request-error";
import { ModelError } from "./model-error";
import { NotFoundError } from "./not-found-error";
import { UnauthorizedError } from "./unauthorized-error";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

type FormState = {
  errors: {
    message: string;
  }[];
};

export function withFormActionErrorHandler<
  T extends (prevState: FormState, ...args: any[]) => Promise<any>
>(fn: T) {
  return async function (
    prevState: FormState,
    ...args: Parameters<T>[1] extends undefined ? [] : [Parameters<T>[1]]
  ): Promise<FormState> {
    try {
      return await fn(prevState, ...args);
    } catch (error) {
      if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      const requestId = (await headers()).get("x-vercel-id");
      const log = logger.child({ requestId });

      let errorMessage = "An unexpected error occurred.";

      if (error instanceof ZodError) {
        errorMessage = fromZodError(error).message;
      } else if (error instanceof BadRequestError) {
        errorMessage = error.message;
      } else if (error instanceof UnauthorizedError) {
        errorMessage = error.message;
      } else if (error instanceof NotFoundError) {
        errorMessage = error.message;
      } else if (error instanceof ModelError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      log.error(
        {
          error: {
            name: (error as Error).name,
            message: (error as Error).message,
            stack: (error as Error).stack,
            cause: (error as Error).cause,
          },
        },
        errorMessage
      );

      return {
        errors: [{ message: errorMessage }],
      };
    }
  };
}
