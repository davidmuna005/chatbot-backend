import { Router } from 'express';

export default function createHealthRouter({ config, database, connectorRegistry, checkDatabaseHealth }) {
  const router = Router();

  router.get('/health', async (_req, res, next) => {
    try {
      const databaseHealth = await checkDatabaseHealth();

      res.json({
        application: { status: 'ok' },
        database: databaseHealth,
        configuration: { loaded: true },
        connectorRegistry: { registered: connectorRegistry.list() },
        environment: {
          nodeEnv: config.environment.NODE_ENV,
          appName: config.environment.APP_NAME
        }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
