import { Router } from 'express';
import createRootRouter from './root.js';
import createHealthRouter from './health.js';
import createVersionRouter from './version.js';

export default function createRoutes({ config, database, connectorRegistry, checkDatabaseHealth }) {
  const router = Router();

  router.use(createRootRouter(config));
  router.use(createHealthRouter({ config, database, connectorRegistry, checkDatabaseHealth }));
  router.use(createVersionRouter(config));

  return router;
}
