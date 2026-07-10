import { Router } from 'express';

const router = Router();

router.post('/notify', (req, res) => {
  const { eventType, recipients } = req.body;
  res.json({ success: true, eventType, recipients, status: 'queued' });
});

export default router;
