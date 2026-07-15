/**
 * Dashboard Controller
 * Handles dashboard API endpoints
 */

import { DashboardService } from '../services/dashboardService.js';
import { AuditService } from '../services/auditService.js';

export function createDashboardController(dependencies = {}) {
  const { database, connectorRegistry, logger, config } = dependencies;

  const dashboardService = new DashboardService({
    database,
    connectorRegistry,
    logger,
  });

  const auditService = new AuditService({
    database,
    logger,
  });

  return {
    /**
     * GET /api/v1/dashboard/overview
     * Get dashboard overview with current statistics
     */
    async getOverview(req, res) {
      try {
        const result = await dashboardService.getOverview();

        // Log dashboard access for audit
        await auditService.logSensitiveOperation(req, 'DASHBOARD_ACCESS', 'dashboard', {
          action: 'view_overview',
        });

        if (result.success) {
          return res.status(200).json({
            success: true,
            data: result.data,
          });
        }

        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to get dashboard overview',
        });
      } catch (error) {
        logger?.error?.('Dashboard overview error', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    },

    /**
     * GET /api/v1/dashboard/alerts
     * Get system alerts
     */
    async getAlerts(req, res) {
      try {
        const result = await dashboardService.getAlerts();

        if (result.success) {
          return res.status(200).json(result);
        }

        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to get alerts',
        });
      } catch (error) {
        logger?.error?.('Dashboard alerts error', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    },

    /**
     * GET /api/v1/dashboard/activity-feed
     * Get activity feed
     */
    async getActivityFeed(req, res) {
      try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const result = await dashboardService.getActivityFeed(limit, offset);

        if (result.success) {
          return res.status(200).json(result);
        }

        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to get activity feed',
        });
      } catch (error) {
        logger?.error?.('Dashboard activity feed error', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    },

    /**
     * GET /api/v1/dashboard/system-status
     * Get detailed system status
     */
    async getSystemStatus(req, res) {
      try {
        const status = await dashboardService.getSystemStatus();

        return res.status(200).json({
          success: true,
          data: {
            status,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        logger?.error?.('System status error', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    },
  };
}
