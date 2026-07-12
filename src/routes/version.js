import { Router } from 'express';

export default function createVersionRouter(config) {
  const router = Router();

  router.get('/version', (_req, res) => {
    res.json({
      application: config.environment.APP_NAME,
      version: config.environment.APP_VERSION,
      environment: config.environment.NODE_ENV,
      buildTime: config.environment.BUILD_TIME || null
    });
  });

  return router;
}
