import express, { Express } from 'express';
import cors from 'cors';
import { notFound } from './utils';
import { errorHandler } from './middlewares/errorHandler.middleware';
import movieRoutes from './routes/movie.route';

/**
 * CORS allowlist from env. When set, only these origins are allowed.
 * In production with no origins set, no origin is allowed.
 * In non-production with no origins set, default cors() allows localhost etc.
 */
function getCorsAllowlist(): string[] {
  const fromList =
    process.env.CORS_ORIGINS?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const single = process.env.FRONTEND_ORIGIN?.trim();
  const allowlist = fromList.length > 0 ? fromList : single ? [single] : [];
  return [...new Set(allowlist)];
}

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
app.use(express.json());

app.get('/', (req, res) => {
    res.send('CinéConnect Backend is running');
});

app.use('/api/movies', movieRoutes);

// 404: no route matched
app.use((_req, _res, next) => next(notFound('Route not found')));

// Global error handler (must be last)
app.use(errorHandler);

export default app;