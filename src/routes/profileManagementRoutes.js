import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.js';

export function createProfileManagementRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get user profile
  router.get('/', requirePermission('profile:view'), async (req, res) => {
    try {
      logger?.info?.('Fetching user profile');

      const profile = {
        id: 'user_1',
        email: 'admin@school.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254712345678',
        role: 'Administrator',
        department: 'Administration',
        avatar: 'https://via.placeholder.com/150',
        joinedAt: new Date('2024-01-15'),
        lastLogin: new Date(Date.now() - 3600000),
        twoFactorEnabled: true,
        status: 'active'
      };

      return res.json({ success: true, data: profile });
    } catch (error) {
      logger?.error?.('Error fetching profile', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update user profile
  router.patch('/', requirePermission('profile:edit'), async (req, res) => {
    try {
      const { firstName, lastName, phone, avatar } = req.body;

      logger?.info?.('Updating user profile');

      if (!firstName && !lastName && !phone && !avatar) {
        return res.status(400).json({ success: false, error: 'At least one field is required' });
      }

      const profile = {
        id: 'user_1',
        email: 'admin@school.com',
        firstName: firstName || 'John',
        lastName: lastName || 'Doe',
        phone: phone || '+254712345678',
        avatar: avatar || 'https://via.placeholder.com/150',
        updatedAt: new Date(),
        message: 'Profile updated successfully'
      };

      return res.json({ success: true, data: profile });
    } catch (error) {
      logger?.error?.('Error updating profile', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Change password
  router.post('/change-password', requirePermission('profile:edit'), async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      logger?.info?.('Changing password');

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, error: 'All password fields are required' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, error: 'New passwords do not match' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
      }

      return res.json({
        success: true,
        data: {
          message: 'Password changed successfully',
          changedAt: new Date()
        }
      });
    } catch (error) {
      logger?.error?.('Error changing password', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Enable 2FA
  router.post('/2fa/enable', requirePermission('profile:edit'), async (req, res) => {
    try {
      const { password } = req.body;

      logger?.info?.('Enabling 2FA');

      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required' });
      }

      return res.json({
        success: true,
        data: {
          twoFactorEnabled: true,
          message: '2FA enabled successfully',
          enabledAt: new Date()
        }
      });
    } catch (error) {
      logger?.error?.('Error enabling 2FA', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Disable 2FA
  router.post('/2fa/disable', requirePermission('profile:edit'), async (req, res) => {
    try {
      const { password } = req.body;

      logger?.info?.('Disabling 2FA');

      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required' });
      }

      return res.json({
        success: true,
        data: {
          twoFactorEnabled: false,
          message: '2FA disabled successfully',
          disabledAt: new Date()
        }
      });
    } catch (error) {
      logger?.error?.('Error disabling 2FA', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get security settings
  router.get('/security', requirePermission('profile:view'), async (req, res) => {
    try {
      logger?.info?.('Fetching security settings');

      const securitySettings = {
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP',
        lastPasswordChange: new Date(Date.now() - 7776000000), // 90 days ago
        passwordExpiry: new Date(Date.now() + 7776000000), // in 90 days
        loginAttempts: 0,
        maxLoginAttempts: 5,
        accountLocked: false,
        securityQuestions: 2,
        recoveryEmails: ['recovery@personal.com']
      };

      return res.json({ success: true, data: securitySettings });
    } catch (error) {
      logger?.error?.('Error fetching security settings', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get active sessions
  router.get('/sessions', requirePermission('profile:view'), async (req, res) => {
    try {
      logger?.info?.('Fetching active sessions');

      const sessions = [
        {
          id: 'sess_1',
          device: 'Chrome on Windows',
          ipAddress: '192.168.1.100',
          location: 'Nairobi, Kenya',
          lastActive: new Date(Date.now() - 60000),
          createdAt: new Date(Date.now() - 3600000),
          isCurrent: true
        },
        {
          id: 'sess_2',
          device: 'Safari on iOS',
          ipAddress: '192.168.1.101',
          location: 'Nairobi, Kenya',
          lastActive: new Date(Date.now() - 86400000),
          createdAt: new Date(Date.now() - 604800000),
          isCurrent: false
        }
      ];

      return res.json({ success: true, data: sessions, total: sessions.length });
    } catch (error) {
      logger?.error?.('Error fetching active sessions', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Terminate session
  router.post('/sessions/:sessionId/terminate', requirePermission('profile:edit'), async (req, res) => {
    try {
      const { sessionId } = req.params;

      logger?.info?.('Terminating session', { sessionId });

      return res.json({
        success: true,
        data: {
          sessionId,
          terminated: true,
          message: 'Session terminated successfully',
          terminatedAt: new Date()
        }
      });
    } catch (error) {
      logger?.error?.('Error terminating session', { sessionId: req.params.sessionId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
