import express, { Express } from 'express';
import cors from 'cors';
import { notFound } from './utils';
import { errorHandler } from './middlewares/errorHandler.middleware';
import movieRoutes from './routes/movie.route';

const app: Express = express();

app.use(cors());
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