type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const defaultLevel: LogLevel = import.meta.env.DEV ? "debug" : "warn";
const configuredLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined) ?? defaultLevel;

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[configuredLevel];
}

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    scope: "frontend",
    msg,
    ...(meta ?? {}),
  };
  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else if (level === "info") {
    console.info(payload);
  } else {
    console.debug(payload);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};

