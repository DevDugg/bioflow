import { NextRequest } from "next/server";
import { CustomError } from "@/server/errors/custom-error";

type ApiHandler = (req: NextRequest) => Promise<Response>;
type ServerAction = (...args: any[]) => Promise<any>;

interface ErrorHandlerOptions {
  isDevelopment?: boolean;
}

export function withErrorHandler(
  handler: ApiHandler,
  options?: ErrorHandlerOptions,
): ApiHandler;
export function withErrorHandler(
  handler: ServerAction,
  options?: ErrorHandlerOptions,
): ServerAction;
export function withErrorHandler(
  handler: ApiHandler | ServerAction,
  options: ErrorHandlerOptions = {
    isDevelopment: process.env.NODE_ENV === "development",
  },
): ApiHandler | ServerAction {
  return async (...args: any[]) => {
    try {
      return await (handler as (...args: any[]) => any)(...args);
    } catch (err: any) {
      // Next.js redirect throws an error, so we need to handle it
      if (err.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }

      const isApiHandler =
        args.length > 0 &&
        args[0] &&
        typeof args[0] === "object" &&
        "nextUrl" in args[0] &&
        "method" in args[0];

      if (err instanceof CustomError) {
        // Log critical server-side custom errors
        if (err.statusCode >= 500) {
          console.error(
            `[${new Date().toISOString()}] Critical CustomError:`,
            err.serializeErrors(),
          );
        }

        if (isApiHandler) {
          return new Response(
            JSON.stringify({ errors: err.serializeErrors() }),
            {
              status: err.statusCode,
              headers: { "Content-Type": "application/json" },
            },
          );
        } else {
          // For server actions, return error in a structured format
          return { errors: err.serializeErrors() };
        }
      }

      // Log all other unexpected errors
      console.error(`[${new Date().toISOString()}] Unhandled Error:`, err);

      // hide stack trace in production for the generic response
      const errorMessage =
        options.isDevelopment && err instanceof Error
          ? err.message
          : "Something went wrong";

      const errorResponse = { errors: [{ message: errorMessage }] };

      if (isApiHandler) {
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return errorResponse;
      }
    }
  };
}
