import { Router } from 'express';

export default function createRootRouter(config) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      status: 'running',
      application: config.environment.APP_NAME,
      environment: config.environment.NODE_ENV
    });
  });

  return router;
}
