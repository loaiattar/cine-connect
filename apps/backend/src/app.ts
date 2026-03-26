import "./types/express/augmentation";
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { sql } from 'drizzle-orm';
import { db } from './db';
import { notFound } from './utils';
import { errorHandler } from './middlewares/errorHandler.middleware';
import movieRoutes from './routes/movie.route';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import followRoutes from './routes/follow.route';
import messageRoutes from './routes/message.route';
import notificationRoutes from './routes/notification.route';
import { openApiSpec } from './openapi';
import { getCorsAllowlist } from './config';
import { authRateLimiter, generalApiRateLimiter } from './middlewares/rateLimit.middleware';
import path from "node:path";

function applyCors(app: Express): void {
  const allowlist = getCorsAllowlist();
  if (allowlist.length > 0) {
    app.use(cors({ origin: allowlist, credentials: true }));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(cors({ origin: false }));
  } else {
    app.use(cors({ origin: true, credentials: true }));
  }
}

const app: Express = express();

/**
 * HTTP security headers (Helmet).
 *
 * CSP exceptions for embedded Swagger UI (`/docs`, `/swagger`, `/?docs=1`):
 * - `script-src` / `style-src`: `https://unpkg.com` (swagger-ui-dist@5), `'unsafe-inline'` (inline boot
 *   script in `SWAGGER_HTML`), `'unsafe-eval'` (Swagger UI bundle uses dynamic code paths in the browser).
 * - `connect-src` `'self'`: in-browser fetch of `/openapi.json` same-origin.
 * - `img-src` / `font-src`: Swagger UI assets from CDN (`https:`, `data:`).
 *
 * See also: `apps/backend/README.md` → Security headers.
 */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  })
);

applyCors(app);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cookieParser());

// HTTP request logging via morgan (skip in tests).
// MORGAN_FORMAT: preset ("combined", "dev", "common", "short", "tiny") or a custom token string — see morgan docs.
if (process.env.NODE_ENV !== 'test') {
  const logFormat =
    process.env.MORGAN_FORMAT ??
    (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');
  app.use(morgan(logFormat));
}

// API spec and Swagger UI — register BEFORE express.json() so we see the raw URL first
const swaggerSpec = JSON.parse(JSON.stringify(openApiSpec));

const SWAGGER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CinéConnect API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

function sendSwaggerHtml(_req: express.Request, res: express.Response): void {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(SWAGGER_HTML);
}

// Express 5: app.use("/") matches ONLY the exact path "/", not /docs or /version.
// So we mount a handler on each path we need (each runs for that path only).
function rootHandler(req: express.Request, res: express.Response): void {
  if (req.query.version === "1" || req.query.version === "true") {
    res.json({ docs: true, message: "API docs: /?docs=1 and /?openapi=1" });
    return;
  }
  if (req.query.openapi === "1" || req.query.openapi === "true") {
    res.json(swaggerSpec);
    return;
  }
  const showDocs =
    req.query.docs === "1" ||
    req.query.docs === "true" ||
    (typeof req.query.docs !== "undefined" && req.query.docs !== "") ||
    (req.originalUrl?.includes("docs=1") ?? false);
  if (showDocs) {
    sendSwaggerHtml(req, res);
    return;
  }
  res.send(
    "CinéConnect Backend is running. API docs: <a href='/docs'>/docs</a> | <a href='/?docs=1'>/?docs=1</a> | Spec: <a href='/openapi.json'>/openapi.json</a>"
  );
}

app.get("/", rootHandler);

/** Liveness / readiness for orchestration: 200 if DB responds, 503 otherwise. */
app.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ status: "healthy", database: "connected" });
  } catch {
    res.status(503).json({ status: "unhealthy", database: "disconnected" });
  }
});

app.get("/docs", sendSwaggerHtml);
app.get("/docs/", sendSwaggerHtml);
app.get("/version", (_req, res) => res.json({ docs: true, message: "API docs at /docs and /?docs=1" }));
app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));
app.get("/swagger", sendSwaggerHtml);
app.get("/swagger/", sendSwaggerHtml);

app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

const API_V1 = '/api/v1';
app.use(API_V1, generalApiRateLimiter);
app.use(`${API_V1}/auth`, authRateLimiter, authRoutes);
app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/follows`, followRoutes);
app.use(`${API_V1}/messages`, messageRoutes);
app.use(`${API_V1}/notifications`, notificationRoutes);
app.use(`${API_V1}/movies`, movieRoutes);

// 404: no route matched
app.use((_req, _res, next) => next(notFound('Route not found')));

// Global error handler (must be last)
app.use(errorHandler);

export default app;