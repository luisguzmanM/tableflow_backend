import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

type ValidationTarget = "body" | "query" | "params";

export function validateRequest(schema: Schema, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      res.status(400).json({
        error: "Validation failed",
        details,
      });
      return;
    }

    req[target] = value;
    next();
  };
}
