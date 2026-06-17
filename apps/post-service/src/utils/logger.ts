// Journalise les événements au format JSON.
type Meta = Record<string, unknown>;

const SERVICE = "post-service";

function emit(level: "info" | "warn" | "error", msg: string, meta?: Meta): void {
  const line = JSON.stringify({
    // meta en premier : les champs fixes ci-dessous ne peuvent pas être écrasés.
    ...meta,
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    msg,
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
