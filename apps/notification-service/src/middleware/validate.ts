import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

function fail(res: Response, error: { flatten: () => unknown }): void {
  res.status(400).json({ error: "Validation failed", details: error.flatten() });
}

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateParams(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      fail(res, parsed.error);
      return;
    }
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      fail(res, parsed.error);
      return;
    }
    req.query = parsed.data;
    next();
  };
}
