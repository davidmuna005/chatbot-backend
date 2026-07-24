import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';
import { createSchoolOnboardingService } from '../../services/schoolOnboardingService.js';

/**
 * School Management Routes
 * Manage all deployed school instances
 */
export function createSchoolManagementRouter(dependencies = {}) {
  const router = Router();
  const { logger, schoolRegistry } = dependencies;
  const onboardingService = dependencies.schoolOnboardingService || createSchoolOnboardingService({ schoolRegistry, logger });

  router.get('/', requirePermission('schools:view'), async (req, res) => {
    try {
      const { status, search, limit = 50, offset = 0 } = req.query;
      logger?.info?.('Fetching schools', { status, search });
      const schools = await onboardingService.listSchools();
      const filtered = schools.filter((school) => {
        if (status && school.status !== status) return false;
        if (search) {
          const query = `${search}`.toLowerCase();
          return `${school.name}`.toLowerCase().includes(query) || `${school.schoolAdministrator}`.toLowerCase().includes(query);
        }
        return true;
      });

      return res.json({ success: true, data: filtered.slice(0, parseInt(limit) || 50), total: filtered.length, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (error) {
      logger?.error?.('Error fetching schools', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:schoolId', requirePermission('schools:view'), async (req, res) => {
    try {
      const { schoolId } = req.params;
      logger?.info?.('Fetching school profile', { schoolId });
      const result = await onboardingService.getSchool(schoolId);
      return res.json({ success: true, data: result.data });
    } catch (error) {
      logger?.error?.('Error fetching school', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/', requirePermission('schools:manage'), async (req, res) => {
    try {
      const { name, adminEmail, licenseType, connectorType, apiUrl, status, host, port, databaseName, username, password, ssl } = req.body;
      logger?.info?.('Registering new school', { name, adminEmail });

      if (!name || !adminEmail || !apiUrl) {
        return res.status(400).json({ success: false, error: 'School name, administrator email, and API URL are required' });
      }

      const result = await onboardingService.registerSchool({
        name,
        adminEmail,
        licenseType,
        connectorType,
        apiUrl,
        status,
        host,
        port,
        databaseName,
        username,
        password,
        ssl
      });

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger?.error?.('Error registering school', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/:schoolId/connector/test', requirePermission('schools:manage'), async (req, res) => {
    try {
      const result = await onboardingService.testConnector(req.params.schoolId, req.body);
      return res.json(result);
    } catch (error) {
      logger?.error?.('Error testing connector', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/:schoolId/connector/discover', requirePermission('schools:manage'), async (req, res) => {
    try {
      const result = await onboardingService.discoverSchema(req.params.schoolId);
      return res.json(result);
    } catch (error) {
      logger?.error?.('Error discovering schema', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/:schoolId/connector/activate', requirePermission('schools:manage'), async (req, res) => {
    try {
      const result = await onboardingService.activateConnector(req.params.schoolId);
      return res.json(result);
    } catch (error) {
      logger?.error?.('Error activating connector', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:schoolId/heartbeat', requirePermission('schools:view'), async (req, res) => {
    try {
      const result = await onboardingService.getHeartbeat(req.params.schoolId);
      return res.json(result);
    } catch (error) {
      logger?.error?.('Error fetching school health', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:schoolId/monitoring', requirePermission('schools:view'), async (req, res) => {
    try {
      const result = await onboardingService.getMonitoring(req.params.schoolId);
      return res.json(result);
    } catch (error) {
      logger?.error?.('Error fetching monitoring', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.patch('/:schoolId/status', requirePermission('schools:manage'), async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { status } = req.body;
      if (!['active', 'suspended', 'disabled', 'deleted'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
      const school = await onboardingService.getSchool(schoolId);
      const updated = schoolRegistry?.updateSchool?.(schoolId, { status });
      return res.json({ success: true, data: { schoolId, status, updatedAt: new Date(), updatedBy: req.user?.email || 'unknown', updated } });
    } catch (error) {
      logger?.error?.('Error updating school status', { schoolId: req.params.schoolId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
