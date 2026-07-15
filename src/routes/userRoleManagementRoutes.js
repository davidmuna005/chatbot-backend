/**
 * User Management Routes
 */

import { Router } from 'express';
import { verifyToken, requirePermission } from '../middleware/rbac.js';
import { UserService, RoleService } from '../services/userRoleService.js';
import { AuditService } from '../services/auditService.js';

export function createUserManagementRouter(dependencies = {}) {
  const router = Router();
  const { database, logger } = dependencies;
  
  const userService = new UserService({ database, logger });
  const auditService = new AuditService({ database, logger });

  router.use(verifyToken);

  /**
   * GET /api/v1/admin/users - List users
   */
  router.get('/', requirePermission('users:view'), async (req, res) => {
    try {
      const { role, status, limit = 50, offset = 0 } = req.query;
      
      const result = await userService.listUsers(
        { role, status },
        parseInt(limit),
        parseInt(offset)
      );

      res.json(result);
    } catch (error) {
      logger?.error?.('List users error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/users/:id - Get user
   */
  router.get('/:id', requirePermission('users:view'), async (req, res) => {
    try {
      const result = await userService.getUser(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get user error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/users - Create user
   */
  router.post('/', requirePermission('users:manage'), async (req, res) => {
    try {
      const result = await userService.createUser(req.body);

      await auditService.logSensitiveOperation(req, 'USER_CREATED', 'users', {
        email: req.body.email,
        role: req.body.role,
      });

      res.status(201).json(result);
    } catch (error) {
      logger?.error?.('Create user error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * PATCH /api/v1/admin/users/:id - Update user
   */
  router.patch('/:id', requirePermission('users:manage'), async (req, res) => {
    try {
      const result = await userService.updateUser(req.params.id, req.body);

      await auditService.logSensitiveOperation(req, 'USER_UPDATED', 'users', {
        userId: req.params.id,
        updates: Object.keys(req.body),
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Update user error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * DELETE /api/v1/admin/users/:id - Delete user
   */
  router.delete('/:id', requirePermission('users:manage'), async (req, res) => {
    try {
      const result = await userService.deleteUser(req.params.id);

      await auditService.logSensitiveOperation(req, 'USER_DELETED', 'users', {
        userId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Delete user error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/users/:id/reset-password - Reset password
   */
  router.post('/:id/reset-password', requirePermission('users:manage'), async (req, res) => {
    try {
      const result = await userService.resetPassword(req.params.id);

      await auditService.logSensitiveOperation(req, 'USER_PASSWORD_RESET', 'users', {
        userId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Reset password error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/users/:id/activity - User activity
   */
  router.get('/:id/activity', requirePermission('audit:view'), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 30;
      const result = await userService.getUserActivity(req.params.id, limit);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get user activity error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}

/**
 * Role Management Routes
 */
export function createRoleManagementRouter(dependencies = {}) {
  const router = Router();
  const { database, logger } = dependencies;
  
  const roleService = new RoleService({ database, logger });
  const auditService = new AuditService({ database, logger });

  router.use(verifyToken);

  /**
   * GET /api/v1/admin/roles - List roles
   */
  router.get('/', requirePermission('roles:view'), async (req, res) => {
    try {
      const result = await roleService.listRoles();
      res.json(result);
    } catch (error) {
      logger?.error?.('List roles error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/roles/:id - Get role
   */
  router.get('/:id', requirePermission('roles:view'), async (req, res) => {
    try {
      const result = await roleService.getRole(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get role error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/roles - Create role
   */
  router.post('/', requirePermission('roles:manage'), async (req, res) => {
    try {
      const result = await roleService.createRole(req.body);

      await auditService.logSensitiveOperation(req, 'ROLE_CREATED', 'roles', {
        name: req.body.name,
      });

      res.status(201).json(result);
    } catch (error) {
      logger?.error?.('Create role error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * PATCH /api/v1/admin/roles/:id - Update role
   */
  router.patch('/:id', requirePermission('roles:manage'), async (req, res) => {
    try {
      const result = await roleService.updateRole(req.params.id, req.body);

      await auditService.logSensitiveOperation(req, 'ROLE_UPDATED', 'roles', {
        roleId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Update role error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * DELETE /api/v1/admin/roles/:id - Delete role
   */
  router.delete('/:id', requirePermission('roles:manage'), async (req, res) => {
    try {
      const result = await roleService.deleteRole(req.params.id);

      await auditService.logSensitiveOperation(req, 'ROLE_DELETED', 'roles', {
        roleId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Delete role error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/roles/:id/permissions - Get role permissions
   */
  router.get('/:id/permissions', requirePermission('roles:view'), async (req, res) => {
    try {
      const result = await roleService.getRolePermissions(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get role permissions error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * PATCH /api/v1/admin/roles/:id/permissions - Update permissions
   */
  router.patch('/:id/permissions', requirePermission('roles:manage'), async (req, res) => {
    try {
      const result = await roleService.updateRolePermissions(req.params.id, req.body.permissions);

      await auditService.logSensitiveOperation(req, 'ROLE_PERMISSIONS_UPDATED', 'roles', {
        roleId: req.params.id,
        permissionCount: req.body.permissions?.length || 0,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Update permissions error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}
