import express from 'express';
import { AnalyticsController } from '../../dashboard/analyticsController.js';

export const createAnalyticsRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new AnalyticsController(dependencies);

  router.get('/overview', controller.overview.bind(controller));
  router.get('/dashboard', controller.dashboard.bind(controller));

  return router;
};
