import { CustomError } from "./custom-error";

export class NoResponseError extends CustomError {
  statusCode = 500;

  constructor() {
    super("No response");
    Object.setPrototypeOf(this, NoResponseError.prototype);
  }

  serializeErrors() {
    return [{ message: "No response" }];
  }
}
