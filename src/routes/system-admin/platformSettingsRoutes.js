import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.js';

/**
 * Platform Settings Routes
 * Configure platform-wide settings
 */
export function createPlatformSettingsRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get all settings
  router.get('/', requirePermission('settings:view'), async (req, res) => {
    try {
      logger?.info?.('Fetching platform settings');

      const settings = {
        branding: {
          platformName: 'School Communication Platform',
          logo: 'https://platform.com/logo.png',
          primaryColor: '#0066cc',
          supportEmail: 'support@platform.com'
        },
        security: {
          requireMFA: false,
          sessionTimeout: 3600,
          passwordPolicy: { minLength: 8, requireSpecialChars: true }
        },
        webhooks: {
          retryPolicy: { maxAttempts: 5, backoffInterval: 300 },
          timeout: 30000
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: true,
          whatsappEnabled: true
        }
      };

      return res.json({ success: true, data: settings });
    } catch (error) {
      logger?.error?.('Error fetching settings', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update settings
  router.patch('/', requirePermission('settings:manage'), async (req, res) => {
    try {
      const { settings } = req.body;

      logger?.info?.('Updating platform settings');

      if (!settings) {
        return res.status(400).json({ success: false, error: 'Settings are required' });
      }

      return res.json({
        success: true,
        data: {
          ...settings,
          updatedAt: new Date(),
          updatedBy: req.user?.email || 'unknown'
        }
      });
    } catch (error) {
      logger?.error?.('Error updating settings', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
