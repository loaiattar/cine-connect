import dotenv from 'dotenv';
import { validateEnv } from './config';
import app from './app';

dotenv.config();
validateEnv();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("");
  console.log(">>> CinéConnect Backend (with /docs and /version) <<<");
  console.log(`Server: http://localhost:${port}`);
  console.log(`Docs:   http://localhost:${port}/docs`);
  console.log(`Check:  http://localhost:${port}/version`);
  console.log("");
});
