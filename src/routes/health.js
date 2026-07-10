import { Router } from 'express';

const router = Router();

router.get('/system', (_req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version
  });
});

export default router;
