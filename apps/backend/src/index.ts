import http from 'http';
import dotenv from 'dotenv';
import { validateEnv, closeDatabase } from './config';
import app from './app';
import { createSocketServer, closeSocketServer } from './socket';
import { logger } from './logger';

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

  logger.info({ signal }, 'Received shutdown signal');

  const forceExit = setTimeout(() => {
    logger.error('Shutdown timeout exceeded; forcing exit.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  try {
    await closeSocketServer();
    logger.info('Socket.io closed.');
  } catch (err) {
    logger.error({ err }, 'Error closing Socket.io');
  }

  await new Promise<void>((resolve) => {
    httpServer.close((err) => {
      if (err) {
        logger.error({ err }, 'Error closing HTTP server');
      } else {
        logger.info('HTTP server closed.');
      }
      resolve();
    });
  });

  try {
    await closeDatabase();
    logger.info('Database connections closed.');
  } catch (err) {
    logger.error({ err }, 'Error closing database');
  }

  clearTimeout(forceExit);
  logger.info('Shutdown complete.');
  process.exit(0);
}

process.once('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});
process.once('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(
      { port, code: err.code },
      `Port ${port} is already in use. Stop the other process (or change PORT in apps/backend/.env) and try again.`
    );
    process.exit(1);
  }
  throw err;
});

httpServer.listen(port, () => {
  logger.info(
    {
      port,
      serverUrl: `http://localhost:${port}`,
      docsUrl: `http://localhost:${port}/docs`,
      socketOrigin: `http://localhost:${port}`,
    },
    "CineConnect backend started"
  );
});
