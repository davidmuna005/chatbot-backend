import express from 'express';
import { createPlatformOverviewRouter } from './platformOverviewRoutes.js';
import { createSchoolManagementRouter } from './schoolManagementRoutes.js';
import { createDeploymentManagementRouter } from './deploymentManagementRoutes.js';
import { createLicenseManagementRouter } from './licenseManagementRoutes.js';
import { createWebhookMonitoringRouter } from './webhookMonitoringRoutes.js';
import { createUsageAnalyticsRouter } from './usageAnalyticsRoutes.js';
import { createProviderConfigurationRouter } from './providerConfigurationRoutes.js';
import { createPlatformLogsRouter } from './platformLogsRoutes.js';
import { createPlatformSettingsRouter } from './platformSettingsRoutes.js';

/**
 * System Admin Router
 * Central registration point for all system admin routes
 */
export function createSystemAdminRouter(dependencies = {}) {
  const router = express.Router();

  // Register all system admin route modules
  router.use('/overview', createPlatformOverviewRouter(dependencies));
  router.use('/schools', createSchoolManagementRouter(dependencies));
  router.use('/deployments', createDeploymentManagementRouter(dependencies));
  router.use('/licenses', createLicenseManagementRouter(dependencies));
  router.use('/webhooks', createWebhookMonitoringRouter(dependencies));
  router.use('/analytics', createUsageAnalyticsRouter(dependencies));
  router.use('/providers', createProviderConfigurationRouter(dependencies));
  router.use('/logs', createPlatformLogsRouter(dependencies));
  router.use('/settings', createPlatformSettingsRouter(dependencies));

  return router;
}
