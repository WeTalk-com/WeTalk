import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

function fail(res: Response, error: { flatten: () => unknown }): void {
	res.status(400).json({ error: "Validation failed", details: error.flatten() });
}

// Valide req.body et le remplace par la donnée parsée (coercée/trimée).
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

// Valide req.params (ex. UUID). En Express 5 req.params est en lecture seule,
// on ne fait que rejeter les valeurs invalides sans réaffecter.
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
