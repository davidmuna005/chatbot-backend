import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, responseTimeMiddleware, createErrorHandler, createNotFoundHandler } from './middleware/index.js';
import createRoutes from './routes/index.js';

export const createApp = ({ config, logger, database, connectorRegistry, checkDatabaseHealth }) => {
  const app = express();

  app.set('trust proxy', true);
  app.use(requestIdMiddleware);
  app.use(responseTimeMiddleware);
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: config.security.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger(logger));
  app.use(createRoutes({ config, database, connectorRegistry, checkDatabaseHealth }));
  app.use(createNotFoundHandler());
  app.use(createErrorHandler(config.environment));

  return app;
};
