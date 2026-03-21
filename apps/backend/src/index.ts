import http from 'http';
import dotenv from 'dotenv';
import { validateEnv, closeDatabase } from './config';
import app from './app';
import { createSocketServer, closeSocketServer } from './socket';

dotenv.config();
validateEnv();

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);
createSocketServer(httpServer);

const SHUTDOWN_TIMEOUT_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10_000;

let shuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  console.log(`\n${signal} received — graceful shutdown…`);

  const forceExit = setTimeout(() => {
    console.error('Shutdown timeout exceeded; forcing exit.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  try {
    await closeSocketServer();
    console.log('Socket.io closed.');
  } catch (err) {
    console.error('Error closing Socket.io:', err);
  }

  await new Promise<void>((resolve) => {
    httpServer.close((err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
      } else {
        console.log('HTTP server closed.');
      }
      resolve();
    });
  });

  try {
    await closeDatabase();
    console.log('Database connections closed.');
  } catch (err) {
    console.error('Error closing database:', err);
  }

  clearTimeout(forceExit);
  console.log('Shutdown complete.');
  process.exit(0);
}

process.once('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});
process.once('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

httpServer.listen(port, () => {
  console.log("");
  console.log(">>> CinéConnect Backend (with /docs and /version) <<<");
  console.log(`Server:   http://localhost:${port}`);
  console.log(`Docs:     http://localhost:${port}/docs`);
  console.log(`Socket.io: same origin (ws upgrade on http://localhost:${port})`);
  console.log("");
});
