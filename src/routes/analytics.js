import { Router } from 'express';

const router = Router();

router.get('/summary', (_req, res) => {
  res.json({
    dailyRequests: 128,
    weeklyRequests: 892,
    monthlyRequests: 3480,
    activeUsers: 56,
    peakHours: ['08:00', '14:00', '16:00']
  });
});

export default router;
