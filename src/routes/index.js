import { Router } from 'express';
import createRootRouter from './root.js';
import createHealthRouter from './health.js';
import createVersionRouter from './version.js';
import createApiRouter from './api/index.js';
import analyticsRouter from './analytics.js';
import authRouter from './auth.js';
import connectorsRouter from './connectors.js';
import eventsRouter from './events.js';
import createWebhookRouter from './webhook/index.js';
import createWhatsAppWebhookRouter from './webhook/whatsapp.js';

export function createRoutes(dependencies = {}) {
  const router = Router();
  const { config, database, connectorRegistry, checkDatabaseHealth, ...rest } = dependencies;

  router.use(createRootRouter(config));
  router.use(createHealthRouter({ config, database, connectorRegistry, checkDatabaseHealth }));
  router.use(createVersionRouter(config));
  router.use('/analytics', analyticsRouter);
  router.use('/events', eventsRouter);
  router.use('/connectors', connectorsRouter);
  router.use('/auth', authRouter);
  router.use('/webhook/whatsapp', createWhatsAppWebhookRouter({ config, logger: rest.logger, messageProcessor: rest.messageProcessor }));
  router.use('/webhook', createWebhookRouter);
  router.use('/dashboard', createWebhookRouter);
  router.use('/api', createApiRouter({ config, database, connectorRegistry, checkDatabaseHealth, ...rest }));

  return router;
}

export default createRoutes;
