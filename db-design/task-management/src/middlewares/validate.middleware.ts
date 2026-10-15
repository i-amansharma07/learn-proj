import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type RequestSource = "body" | "query" | "params";

export const validate = (schema: ZodType, source: RequestSource) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    //express provides this by default
    res.locals.validated ??= {};
    res.locals.validated[source] = result.data;
    next();
  };
};
