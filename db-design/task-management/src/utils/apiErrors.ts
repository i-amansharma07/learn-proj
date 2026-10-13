import { ApiError } from "./ApiError";

export const apiError = {
  badRequest: (message = "BadRequest", details?: unknown) =>
    new ApiError(400, message, details),

  unauthorised: (message = "Authnetication Required") =>
    new ApiError(401, message),

  forbidden: (message = "You do not have permission") =>
    new ApiError(403, message),

  notfound: (resource = "Resource") =>
    new ApiError(404, `${resource} not found`),

  conflict: (message = "Resource conflict") =>
    new ApiError(400, message),

  unprocessableEntity: (message = "Unable to process request") =>
    new ApiError(422, message),

  tooManyRequests: (message = "Too many requests") =>
    new ApiError(429, message),

  internal: (message = "Internal Server Error") =>
    new ApiError(500, message),
};
