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

function shutdown(signal: string): void {
  console.log(`\n${signal} received, closing server...`);
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  // Force exit if close takes too long (e.g. open connections)
  setTimeout(() => {
    console.error('Forced exit after timeout');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

httpServer.listen(port, () => {
  console.log("");
  console.log(">>> CinéConnect Backend (with /docs and /version) <<<");
  console.log(`Server:   http://localhost:${port}`);
  console.log(`Docs:     http://localhost:${port}/docs`);
  console.log(`Socket.io: same origin (ws upgrade on http://localhost:${port})`);
  console.log("");
});
