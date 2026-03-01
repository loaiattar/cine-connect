import http from 'http';
import dotenv from 'dotenv';
import { validateEnv } from './config';
import app from './app';
import { createSocketServer } from './socket';

dotenv.config();
validateEnv();

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);
createSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log("");
  console.log(">>> CinéConnect Backend (with /docs and /version) <<<");
  console.log(`Server:   http://localhost:${port}`);
  console.log(`Docs:     http://localhost:${port}/docs`);
  console.log(`Socket.io: same origin (ws upgrade on http://localhost:${port})`);
  console.log("");
});
