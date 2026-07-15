/**
 * Dashboard Routes
 * Routes for dashboard API endpoints
 */

import { Router } from 'express';
import { createDashboardController } from '../controllers/dashboardController.js';
import { verifyToken, requirePermission } from '../middleware/rbac.js';

export function createDashboardRouter(dependencies = {}) {
  const router = Router();
  const dashboardController = createDashboardController(dependencies);

  // All dashboard routes require authentication and dashboard:view permission
  router.use(verifyToken);

  /**
   * Dashboard Overview
   * GET /api/v1/dashboard/overview
   */
  router.get(
    '/overview',
    requirePermission('dashboard:view'),
    (req, res) => dashboardController.getOverview(req, res),
  );

  /**
   * System Alerts
   * GET /api/v1/dashboard/alerts
   */
  router.get('/alerts', requirePermission('dashboard:view'), (req, res) =>
    dashboardController.getAlerts(req, res),
  );

  /**
   * Activity Feed
   * GET /api/v1/dashboard/activity-feed
   */
  router.get('/activity-feed', requirePermission('dashboard:view'), (req, res) =>
    dashboardController.getActivityFeed(req, res),
  );

  /**
   * System Status
   * GET /api/v1/dashboard/system-status
   */
  router.get('/system-status', requirePermission('dashboard:view'), (req, res) =>
    dashboardController.getSystemStatus(req, res),
  );

  return router;
}
