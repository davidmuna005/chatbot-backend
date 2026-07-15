import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.js';

export function createOTPManagementRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get all OTP requests
  router.get('/', requirePermission('otp:view'), async (req, res) => {
    try {
      const { status, type, limit = 50, offset = 0 } = req.query;

      logger?.info?.('Fetching OTP requests', { status, type });

      const otpRequests = [
        {
          id: 'otp_1',
          recipient: '+254712345678',
          type: 'SMS',
          status: 'verified',
          code: '123456',
          createdAt: new Date(),
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
          attempts: 1
        },
        {
          id: 'otp_2',
          recipient: '+254787654321',
          type: 'WhatsApp',
          status: 'pending',
          code: '654321',
          createdAt: new Date(Date.now() - 300000),
          expiresAt: new Date(Date.now() + 3300000),
          attempts: 0
        }
      ];

      return res.json({
        success: true,
        data: otpRequests,
        total: otpRequests.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger?.error?.('Error fetching OTP requests', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get specific OTP request
  router.get('/:otpId', requirePermission('otp:view'), async (req, res) => {
    try {
      const { otpId } = req.params;

      logger?.info?.('Fetching OTP request', { otpId });

      const otp = {
        id: otpId,
        recipient: '+254712345678',
        type: 'SMS',
        status: 'verified',
        code: '123456',
        createdAt: new Date(),
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        attempts: 1,
        nationalId: '27123456'
      };

      return res.json({ success: true, data: otp });
    } catch (error) {
      logger?.error?.('Error fetching OTP request', { otpId: req.params.otpId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Search OTP requests
  router.get('/search', requirePermission('otp:view'), async (req, res) => {
    try {
      const { query, limit = 20 } = req.query;

      logger?.info?.('Searching OTP requests', { query });

      const results = [
        {
          id: 'otp_1',
          recipient: query,
          type: 'SMS',
          status: 'verified'
        }
      ];

      return res.json({ success: true, data: results, total: results.length });
    } catch (error) {
      logger?.error?.('Error searching OTP requests', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get OTP statistics
  router.get('/stats', requirePermission('otp:view'), async (req, res) => {
    try {
      const stats = {
        totalRequests: 1250,
        verifiedCount: 1100,
        pendingCount: 100,
        failedCount: 50,
        verificationRate: 88,
        successfulToday: 45,
        failedToday: 5
      };

      logger?.info?.('Fetching OTP statistics');
      return res.json({ success: true, data: stats });
    } catch (error) {
      logger?.error?.('Error fetching OTP statistics', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Check for abuse patterns
  router.get('/abuse-check', requirePermission('otp:view'), async (req, res) => {
    try {
      const { timeWindow = '1hour' } = req.query;

      logger?.info?.('Checking OTP abuse patterns', { timeWindow });

      const abusePatterns = {
        suspiciousPhones: ['+254712345678'],
        excessiveAttempts: [
          { phone: '+254712345678', attempts: 15, threshold: 5 },
          { phone: '+254787654321', attempts: 8, threshold: 5 }
        ],
        flagged: true,
        riskLevel: 'medium'
      };

      return res.json({ success: true, data: abusePatterns });
    } catch (error) {
      logger?.error?.('Error checking abuse patterns', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get OTP by recipient
  router.get('/recipient/:recipient', requirePermission('otp:view'), async (req, res) => {
    try {
      const { recipient } = req.params;

      logger?.info?.('Fetching OTP by recipient', { recipient });

      const otps = [
        {
          id: 'otp_1',
          recipient,
          type: 'SMS',
          status: 'verified',
          createdAt: new Date()
        }
      ];

      return res.json({ success: true, data: otps, total: otps.length });
    } catch (error) {
      logger?.error?.('Error fetching OTP by recipient', { recipient: req.params.recipient, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
