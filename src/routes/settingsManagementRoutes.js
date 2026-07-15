import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.js';

export function createSettingsManagementRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get all settings
  router.get('/', requirePermission('settings:view'), async (req, res) => {
    try {
      logger?.info?.('Fetching all settings');

      const settings = {
        school: {
          name: 'Premier Academy',
          email: 'admin@premier.edu',
          phone: '+254712345678',
          address: '123 School Street',
          website: 'www.premier.edu'
        },
        security: {
          otpExpiry: 600,
          maxOtpAttempts: 5,
          sessionTimeout: 1800,
          passwordMinLength: 8,
          requireSpecialChars: true
        },
        notifications: {
          enableSMS: true,
          enableWhatsApp: true,
          enableEmail: true,
          defaultChannel: 'WhatsApp'
        }
      };

      return res.json({ success: true, data: settings });
    } catch (error) {
      logger?.error?.('Error fetching settings', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get settings by category
  router.get('/:category', requirePermission('settings:view'), async (req, res) => {
    try {
      const { category } = req.params;

      logger?.info?.('Fetching settings by category', { category });

      const categorySettings = {
        school: {
          name: 'Premier Academy',
          email: 'admin@premier.edu',
          phone: '+254712345678',
          address: '123 School Street'
        },
        security: {
          otpExpiry: 600,
          maxOtpAttempts: 5,
          sessionTimeout: 1800
        },
        notifications: {
          enableSMS: true,
          enableWhatsApp: true,
          enableEmail: true
        }
      };

      if (!categorySettings[category]) {
        return res.status(404).json({ success: false, error: `Category '${category}' not found` });
      }

      return res.json({ success: true, data: categorySettings[category] });
    } catch (error) {
      logger?.error?.('Error fetching category settings', { category: req.params.category, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update settings
  router.patch('/', requirePermission('settings:manage'), async (req, res) => {
    try {
      const { settings } = req.body;

      logger?.info?.('Updating settings');

      if (!settings) {
        return res.status(400).json({ success: false, error: 'Settings object is required' });
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

  // Update category settings
  router.patch('/:category', requirePermission('settings:manage'), async (req, res) => {
    try {
      const { category } = req.params;
      const { data } = req.body;

      logger?.info?.('Updating category settings', { category });

      if (!data) {
        return res.status(400).json({ success: false, error: 'Data is required' });
      }

      return res.json({
        success: true,
        data: {
          category,
          settings: data,
          updatedAt: new Date(),
          updatedBy: req.user?.email || 'unknown'
        }
      });
    } catch (error) {
      logger?.error?.('Error updating category settings', { category: req.params.category, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Reset category to defaults
  router.post('/:category/reset', requirePermission('settings:manage'), async (req, res) => {
    try {
      const { category } = req.params;

      logger?.info?.('Resetting category to defaults', { category });

      const defaults = {
        school: {
          name: 'School Name',
          email: 'admin@school.com',
          phone: '+254712345678',
          address: 'School Address'
        },
        security: {
          otpExpiry: 600,
          maxOtpAttempts: 5,
          sessionTimeout: 1800
        },
        notifications: {
          enableSMS: true,
          enableWhatsApp: true,
          enableEmail: false
        }
      };

      if (!defaults[category]) {
        return res.status(404).json({ success: false, error: `Category '${category}' not found` });
      }

      return res.json({
        success: true,
        data: {
          category,
          settings: defaults[category],
          message: `${category} settings reset to defaults`,
          resetAt: new Date()
        }
      });
    } catch (error) {
      logger?.error?.('Error resetting category', { category: req.params.category, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Validate settings
  router.post('/validate', requirePermission('settings:view'), async (req, res) => {
    try {
      const { data } = req.body;

      logger?.info?.('Validating settings');

      if (!data) {
        return res.status(400).json({ success: false, error: 'Data is required' });
      }

      const errors = [];
      const warnings = [];

      // Basic validation
      if (data.school?.name && data.school.name.length < 3) {
        errors.push('School name must be at least 3 characters');
      }

      if (data.security?.otpExpiry && data.security.otpExpiry < 60) {
        warnings.push('OTP expiry is very short');
      }

      return res.json({
        success: errors.length === 0,
        data: {
          valid: errors.length === 0,
          errors,
          warnings,
          message: errors.length === 0 ? 'Settings are valid' : 'Validation failed'
        }
      });
    } catch (error) {
      logger?.error?.('Error validating settings', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
