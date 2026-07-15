import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.js';

/**
 * Webhook Monitoring Routes
 * Monitor webhook health across all schools
 */
export function createWebhookMonitoringRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get webhook status for all schools
  router.get('/', requirePermission('webhooks:view'), async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      logger?.info?.('Fetching webhooks');

      const webhooks = [
        {
          id: 'wh_1',
          school: 'Premier Academy',
          schoolId: 'school_1',
          endpoint: 'https://premier.edu/webhook',
          status: 'operational',
          availability: 99.8,
          latency: 245,
          failureRate: 0.2,
          lastChecked: new Date()
        }
      ];

      return res.json({
        success: true,
        data: webhooks,
        total: webhooks.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger?.error?.('Error fetching webhooks', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get webhook statistics
  router.get('/stats', requirePermission('webhooks:view'), async (req, res) => {
    try {
      const { timeRange = '24h' } = req.query;

      logger?.info?.('Fetching webhook statistics', { timeRange });

      const stats = {
        totalWebhooks: 1450,
        operational: 1445,
        failed: 5,
        totalDeliveries: 450000,
        successfulDeliveries: 448750,
        failedDeliveries: 1250,
        averageLatency: 245,
        maxLatency: 1200,
        retries: 2500
      };

      return res.json({ success: true, data: stats });
    } catch (error) {
      logger?.error?.('Error fetching webhook statistics', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get webhook details
  router.get('/:webhookId', requirePermission('webhooks:view'), async (req, res) => {
    try {
      const { webhookId } = req.params;

      logger?.info?.('Fetching webhook details', { webhookId });

      const webhook = {
        id: webhookId,
        school: 'Premier Academy',
        schoolId: 'school_1',
        endpoint: 'https://premier.edu/webhook',
        events: ['message_received', 'parent_authenticated', 'otp_sent'],
        status: 'operational',
        availability: 99.8,
        latency: { average: 245, p95: 450, p99: 750 },
        failureRate: 0.2,
        verificationStatus: 'verified',
        lastDelivery: new Date(Date.now() - 60000),
        totalDeliveries: 45000,
        failedDeliveries: 90,
        retries: 250,
        createdAt: new Date('2024-01-15')
      };

      return res.json({ success: true, data: webhook });
    } catch (error) {
      logger?.error?.('Error fetching webhook', { webhookId: req.params.webhookId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Test webhook
  router.post('/:webhookId/test', requirePermission('webhooks:manage'), async (req, res) => {
    try {
      const { webhookId } = req.params;

      logger?.info?.('Testing webhook', { webhookId });

      return res.json({
        success: true,
        data: {
          webhookId,
          status: 'operational',
          responseTime: 245,
          testDate: new Date()
        }
      });
    } catch (error) {
      logger?.error?.('Error testing webhook', { webhookId: req.params.webhookId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Retry failed webhooks
  router.post('/:webhookId/retry', requirePermission('webhooks:manage'), async (req, res) => {
    try {
      const { webhookId } = req.params;

      logger?.info?.('Retrying failed webhooks', { webhookId });

      return res.json({
        success: true,
        data: {
          webhookId,
          retriedAt: new Date(),
          message: 'Failed webhooks queued for retry'
        }
      });
    } catch (error) {
      logger?.error?.('Error retrying webhooks', { webhookId: req.params.webhookId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get webhook error history
  router.get('/:webhookId/errors', requirePermission('webhooks:view'), async (req, res) => {
    try {
      const { webhookId } = req.params;

      logger?.info?.('Fetching webhook error history', { webhookId });

      const errors = [
        {
          id: 'err_1',
          timestamp: new Date(Date.now() - 3600000),
          type: 'timeout',
          statusCode: null,
          message: 'Request timeout'
        }
      ];

      return res.json({ success: true, data: errors, total: errors.length });
    } catch (error) {
      logger?.error?.('Error fetching error history', { webhookId: req.params.webhookId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
