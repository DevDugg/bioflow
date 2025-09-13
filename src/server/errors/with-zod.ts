import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { BadRequestError } from "./bad-request-error";

export function withZod<T extends z.ZodType<any, any, any>, U>(
  schema: T,
  action: (data: z.infer<T>) => Promise<U>
) {
  return async (payload: z.infer<T>) => {
    const validation = schema.safeParse(payload);
    if (!validation.success) {
      throw new BadRequestError(fromZodError(validation.error).message);
    }
    return action(validation.data);
  };
}
