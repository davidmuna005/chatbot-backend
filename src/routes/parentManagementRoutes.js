/**
 * Parent Management Routes
 */

import { Router } from 'express';
import { verifyToken, requirePermission } from '../middleware/rbac.js';
import { ParentService } from '../services/parentService.js';
import { AuditService } from '../services/auditService.js';

export function createParentManagementRouter(dependencies = {}) {
  const router = Router();
  const { database, connectorRegistry, logger } = dependencies;
  
  const parentService = new ParentService({ database, connectorRegistry, logger });
  const auditService = new AuditService({ database, logger });

  router.use(verifyToken);

  /**
   * GET /api/v1/admin/parents - Search parents
   */
  router.get('/', requirePermission('parents:view'), async (req, res) => {
    try {
      const { search, searchBy = 'name', status, limit = 50, offset = 0 } = req.query;
      
      const result = await parentService.searchParents(
        { searchTerm: search, searchBy, status },
        parseInt(limit),
        parseInt(offset)
      );

      await auditService.logSensitiveOperation(req, 'PARENT_SEARCH', 'parents', {
        searchTerm: search,
        resultCount: result.data?.length || 0,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Parent search error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/parents - Create parent
   */
  router.post('/', requirePermission('parents:manage'), async (req, res) => {
    try {
      const result = await parentService.create(req.body);

      await auditService.logSensitiveOperation(req, 'PARENT_CREATE', 'parents', {
        parentId: result?.data?.parentId || result?.data?.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Create parent error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/parents/:id - Get parent profile
   */
  router.get('/:id', requirePermission('parents:view'), async (req, res) => {
    try {
      const result = await parentService.getParentProfile(req.params.id);

      await auditService.logSensitiveOperation(req, 'PARENT_PROFILE_VIEW', 'parents', {
        parentId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Get parent error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/parents/:id/students - Get linked students
   */
  router.get('/:id/students', requirePermission('parents:view'), async (req, res) => {
    try {
      const result = await parentService.getParentStudents(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get parent students error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/parents/:id/auth-history - Authentication history
   */
  router.get('/:id/auth-history', requirePermission('parents:view'), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const result = await parentService.getAuthHistory(req.params.id, limit);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get auth history error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/parents/:id/lock - Lock account
   */
  router.post('/:id/lock', requirePermission('parents:manage'), async (req, res) => {
    try {
      const result = await parentService.lockAccount(req.params.id);

      await auditService.logSensitiveOperation(req, 'PARENT_ACCOUNT_LOCKED', 'parents', {
        parentId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Lock account error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/parents/:id/unlock - Unlock account
   */
  router.post('/:id/unlock', requirePermission('parents:manage'), async (req, res) => {
    try {
      const result = await parentService.unlockAccount(req.params.id);

      await auditService.logSensitiveOperation(req, 'PARENT_ACCOUNT_UNLOCKED', 'parents', {
        parentId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Unlock account error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/parents/:id/reset-sessions - Reset sessions
   */
  router.post('/:id/reset-sessions', requirePermission('parents:manage'), async (req, res) => {
    try {
      const result = await parentService.resetSessions(req.params.id);

      await auditService.logSensitiveOperation(req, 'PARENT_SESSIONS_RESET', 'parents', {
        parentId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Reset sessions error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}
