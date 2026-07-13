import { Router } from 'express';
import { createApiV1Router } from '../../controllers/api/v1/index.js';

export default function createApiRouter(dependencies = {}) {
  const router = Router();

  router.use('/v1', createApiV1Router(dependencies));
  return router;
}
