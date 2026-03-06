import express, { Express } from 'express';
import cors from 'cors';
import { notFound } from './utils';
import { errorHandler } from './middlewares/errorHandler.middleware';
import movieRoutes from './routes/movie.route';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import followRoutes from './routes/follow.route';
import messageRoutes from './routes/message.route';
import { openApiSpec } from './openapi';
import { getCorsAllowlist } from './config';
import { authRateLimiter } from './middlewares/rateLimit.middleware';

function applyCors(app: Express): void {
  const allowlist = getCorsAllowlist();
  if (allowlist.length > 0) {
    app.use(cors({ origin: allowlist }));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(cors({ origin: false }));
  } else {
    app.use(cors());
  }
}

const app: Express = express();

applyCors(app);

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
app.get("/docs", sendSwaggerHtml);
app.get("/docs/", sendSwaggerHtml);
app.get("/version", (_req, res) => res.json({ docs: true, message: "API docs at /docs and /?docs=1" }));
app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));
app.get("/swagger", sendSwaggerHtml);
app.get("/swagger/", sendSwaggerHtml);

app.use(express.json());
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/movies', movieRoutes);

// 404: no route matched
app.use((_req, _res, next) => next(notFound('Route not found')));

// Global error handler (must be last)
app.use(errorHandler);

export default app;