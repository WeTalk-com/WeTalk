// Logger JSON minimal (zéro dépendance). Aligné sur les access logs JSON de Nginx.
// Remplaçable par pino plus tard sans toucher aux appelants.
type Meta = Record<string, unknown>;

const SERVICE = "auth-service";

function emit(level: "info" | "warn" | "error", msg: string, meta?: Meta): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    msg,
    ...meta,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, meta?: Meta) => emit("info", msg, meta),
  warn: (msg: string, meta?: Meta) => emit("warn", msg, meta),
  error: (msg: string, meta?: Meta) => emit("error", msg, meta),
};
