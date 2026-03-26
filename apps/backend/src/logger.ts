import pino from "pino";

const env = process.env.NODE_ENV ?? "development";
const defaultLevel = env === "production" ? "info" : "debug";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? defaultLevel,
  base: {
    service: "cine-connect-backend",
    env,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

