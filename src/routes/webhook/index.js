import { Router } from 'express';
import { ServiceResult } from '../../services/serviceResult.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(ServiceResult.success({ status: 'registered' }, {}, null, 'Webhook endpoint ready', 'WEBHOOK_READY'));
});

router.post('/', (req, res) => {
  const payload = req.body ?? {};
  res.json(ServiceResult.success({ received: true, payload }, {}, null, 'Webhook payload received', 'WEBHOOK_RECEIVED'));
});

export default router;
