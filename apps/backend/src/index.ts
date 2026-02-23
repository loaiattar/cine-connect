import dotenv from 'dotenv';
import { validateEnv } from './config';
import app from './app';

dotenv.config();
validateEnv();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
