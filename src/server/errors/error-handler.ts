import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { BadRequestError } from "./bad-request-error";
import { ModelError } from "./model-error";
import { NotFoundError } from "./not-found-error";
import { UnauthorizedError } from "./unauthorized-error";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

export function withErrorHandler<T extends (...args: any[]) => any>(fn: T) {
  return async function (
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | { errors: { message: string }[] }> {
    try {
      return await fn(...args);
    } catch (error) {
      const requestId = (await headers()).get("x-vercel-id");
      const log = logger.child({ requestId });

      let errorMessage = "An unexpected error occurred.";
      let statusCode = 500;

      if (error instanceof ZodError) {
        errorMessage = fromZodError(error).message;
        statusCode = 400;
      } else if (error instanceof BadRequestError) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (error instanceof UnauthorizedError) {
        errorMessage = error.message;
        statusCode = 401;
      } else if (error instanceof NotFoundError) {
        errorMessage = error.message;
        statusCode = 404;
      } else if (error instanceof ModelError) {
        errorMessage = error.message;
        statusCode = 422;
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
          statusCode,
        },
        errorMessage
      );

      return {
        errors: [{ message: errorMessage }],
      };
    }
  };
}
