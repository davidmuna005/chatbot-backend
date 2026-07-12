import http from 'http';
import { config } from './config/index.js';
import { initializeLogger, logger } from './utils/logger.js';
import { connectDatabase, closeDatabase, checkDatabaseHealth } from './database/index.js';
import { initializeConnectorRegistry } from './connectors/index.js';
import { createApp } from './app.js';

let server;
let database;

const startHttpServer = (app, port) =>
  new Promise((resolve, reject) => {
    server = http.createServer(app);

    server.on('error', reject);
    server.listen(port, () => resolve(server));
  });

const closeHttpServer = () =>
  new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const shutdown = async (code = 0) => {
  try {
    logger.info('Shutdown initiated');
    await closeHttpServer();
    await closeDatabase();
    logger.info('Shutdown complete');
  } catch (error) {
    logger.error('Error during shutdown', { message: error.message, stack: error.stack });
    code = 1;
  } finally {
    process.exit(code);
  }
};

const registerSignalHandlers = () => {
  const handleSignal = async (signal) => {
    logger.info(`Received signal ${signal}, shutting down gracefully`);
    await shutdown();
  };

  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('SIGTERM', () => handleSignal('SIGTERM'));

  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught exception', { message: error.message, stack: error.stack });
    await shutdown(1);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.error('Unhandled rejection', { reason });
    await shutdown(1);
  });
};

export const bootstrap = async () => {
  logger.info('Application starting');
  initializeLogger({ level: config.environment.LOG_LEVEL });
  logger.info('Logger Ready');
  logger.info('Environment Loaded');
  logger.info('Configuration Loaded');

  database = await connectDatabase(config.database);
  logger.info('Application Database Connected');

  const connectorRegistry = initializeConnectorRegistry();
  logger.info('Connector Registry Ready');

  const app = createApp({
    config,
    logger,
    database,
    connectorRegistry,
    checkDatabaseHealth
  });

  logger.info('Express Initialized');

  await startHttpServer(app, config.environment.PORT);
  logger.info('Routes Registered');
  logger.info(`Server Started on port ${config.environment.PORT}`);

  registerSignalHandlers();
};
