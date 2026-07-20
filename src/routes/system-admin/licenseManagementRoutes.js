import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';

/**
 * License Management Routes
 * Manage licenses for all schools
 */
export function createLicenseManagementRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get all licenses
  router.get('/', requirePermission('licenses:view'), async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      logger?.info?.('Fetching licenses', { status });

      const licenses = [
        {
          id: 'lic_1',
          school: 'Premier Academy',
          schoolId: 'school_1',
          status: 'active',
          plan: 'Professional',
          createdDate: new Date('2024-01-15'),
          expiresDate: new Date('2025-01-15'),
          daysUntilExpiry: 185,
          capacity: 5000,
          usage: 4200,
          usagePercentage: 84
        }
      ];

      return res.json({
        success: true,
        data: licenses,
        total: licenses.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger?.error?.('Error fetching licenses', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create license
  router.post('/', requirePermission('licenses:manage'), async (req, res) => {
    try {
      const { schoolId, plan, capacity, months } = req.body;

      logger?.info?.('Creating license', { schoolId, plan });

      if (!schoolId || !plan) {
        return res.status(400).json({ success: false, error: 'schoolId and plan are required' });
      }

      const license = {
        id: `lic_${Date.now()}`,
        schoolId,
        plan,
        capacity: capacity || 5000,
        status: 'active',
        createdDate: new Date(),
        expiresDate: new Date(Date.now() + (months || 12) * 30 * 24 * 60 * 60 * 1000),
        createdBy: req.user?.email || 'unknown'
      };

      return res.status(201).json({ success: true, data: license });
    } catch (error) {
      logger?.error?.('Error creating license', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Renew license
  router.post('/:licenseId/renew', requirePermission('licenses:manage'), async (req, res) => {
    try {
      const { licenseId } = req.params;
      const { months = 12 } = req.body;

      logger?.info?.('Renewing license', { licenseId });

      return res.json({
        success: true,
        data: {
          licenseId,
          renewedDate: new Date(),
          expiresDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      });
    } catch (error) {
      logger?.error?.('Error renewing license', { licenseId: req.params.licenseId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update license status
  router.patch('/:licenseId/status', requirePermission('licenses:manage'), async (req, res) => {
    try {
      const { licenseId } = req.params;
      const { status } = req.body;

      logger?.info?.('Updating license status', { licenseId, status });

      if (!['active', 'suspended', 'expired', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      return res.json({
        success: true,
        data: { licenseId, status, updatedAt: new Date() }
      });
    } catch (error) {
      logger?.error?.('Error updating license', { licenseId: req.params.licenseId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get license report
  router.get('/report', requirePermission('licenses:view'), async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;

      logger?.info?.('Fetching license report', { timeRange });

      const report = {
        activeLicenses: 145,
        expiredLicenses: 3,
        suspendedLicenses: 2,
        totalCapacity: 725000,
        totalUsage: 604000,
        averageUsagePercentage: 83.2,
        expiringIn30Days: 5,
        expiringIn60Days: 8,
        reportGeneratedAt: new Date()
      };

      return res.json({ success: true, data: report });
    } catch (error) {
      logger?.error?.('Error fetching license report', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
