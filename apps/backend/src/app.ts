import express, { Express } from 'express';
import cors from 'cors';
import movieRoutes from './routes/movie.route.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('CinéConnect Backend is running');
});

app.use('/api/movies', movieRoutes);

export default app;