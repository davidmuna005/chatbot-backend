import { Router } from 'express';
import { PlatformAdminController } from '../../../controllers/platformAdminController.js';
import { requirePermission, verifyToken } from '../../../middleware/rbac.js';
import { PLATFORM_PERMISSIONS } from '../../../config/permissions.js';

export function createSystemAdminApiRouter(dependencies = {}) {
  const router = Router();
  const controller = new PlatformAdminController(dependencies);

  router.use(verifyToken);

  router.get('/dashboard', requirePermission(PLATFORM_PERMISSIONS.VIEW_DASHBOARD), controller.getDashboard.bind(controller));
  router.get('/schools', requirePermission(PLATFORM_PERMISSIONS.VIEW_SCHOOLS), controller.getSchools.bind(controller));
  router.get('/students', requirePermission(PLATFORM_PERMISSIONS.VIEW_STUDENTS), controller.getStudents.bind(controller));
  router.get('/parents', requirePermission(PLATFORM_PERMISSIONS.VIEW_PARENTS), controller.getParents.bind(controller));
  router.get('/tickets', requirePermission(PLATFORM_PERMISSIONS.VIEW_TICKETS), controller.getTickets.bind(controller));
  router.get('/conversations', requirePermission(PLATFORM_PERMISSIONS.VIEW_CONVERSATIONS), controller.getConversations.bind(controller));
  router.get('/attendance', requirePermission(PLATFORM_PERMISSIONS.VIEW_ATTENDANCE), controller.getAttendance.bind(controller));
  router.get('/results', requirePermission(PLATFORM_PERMISSIONS.VIEW_RESULTS), controller.getResults.bind(controller));
  router.get('/fees', requirePermission(PLATFORM_PERMISSIONS.VIEW_FEES), controller.getFees.bind(controller));
  router.get('/deployments', requirePermission(PLATFORM_PERMISSIONS.VIEW_DEPLOYMENTS), controller.getDeployments.bind(controller));
  router.get('/connectors', requirePermission(PLATFORM_PERMISSIONS.VIEW_CONNECTORS), controller.getConnectors.bind(controller));
  router.post('/connectors', requirePermission(PLATFORM_PERMISSIONS.MANAGE_CONNECTORS), controller.createConnector.bind(controller));
  router.patch('/connectors/:connectorId', requirePermission(PLATFORM_PERMISSIONS.MANAGE_CONNECTORS), controller.updateConnector.bind(controller));
  router.get('/connectors/:connectorId/performance', requirePermission(PLATFORM_PERMISSIONS.VIEW_HEALTH), controller.getConnectorPerformance.bind(controller));
  router.get('/connector-mappings', requirePermission(PLATFORM_PERMISSIONS.VIEW_CONNECTOR_MAPPINGS), controller.getConnectorMappings.bind(controller));
  router.get('/webhooks', requirePermission(PLATFORM_PERMISSIONS.VIEW_WEBHOOKS), controller.getWebhooks.bind(controller));
  router.get('/analytics', requirePermission(PLATFORM_PERMISSIONS.VIEW_ANALYTICS), controller.getAnalytics.bind(controller));
  router.get('/logs', requirePermission(PLATFORM_PERMISSIONS.VIEW_LOGS), controller.getLogs.bind(controller));
  router.get('/licenses', requirePermission(PLATFORM_PERMISSIONS.VIEW_LICENSES), controller.getLicenses.bind(controller));
  router.get('/providers', requirePermission(PLATFORM_PERMISSIONS.VIEW_PROVIDERS), controller.getProviders.bind(controller));
  router.get('/users', requirePermission(PLATFORM_PERMISSIONS.VIEW_USERS), controller.getUsers.bind(controller));
  router.get('/roles', requirePermission(PLATFORM_PERMISSIONS.VIEW_ROLES), controller.getRoles.bind(controller));
  router.get('/permissions', requirePermission(PLATFORM_PERMISSIONS.VIEW_PERMISSIONS), controller.getPermissions.bind(controller));
  router.get('/audit', requirePermission(PLATFORM_PERMISSIONS.VIEW_AUDIT), controller.getAuditLogs.bind(controller));
  router.get('/notifications', requirePermission(PLATFORM_PERMISSIONS.VIEW_NOTIFICATIONS), controller.getNotifications.bind(controller));
  router.get('/broadcasts', requirePermission(PLATFORM_PERMISSIONS.VIEW_BROADCASTS), controller.getBroadcasts.bind(controller));
  router.get('/calendar', requirePermission(PLATFORM_PERMISSIONS.VIEW_CALENDAR), controller.getCalendar.bind(controller));
  router.get('/otp', requirePermission(PLATFORM_PERMISSIONS.VIEW_OTP), controller.getOtpLogs.bind(controller));
  router.get('/sessions', requirePermission(PLATFORM_PERMISSIONS.VIEW_SESSIONS), controller.getSessions.bind(controller));
  router.get('/settings', requirePermission(PLATFORM_PERMISSIONS.VIEW_SETTINGS), controller.getSettings.bind(controller));
  router.get('/health', requirePermission(PLATFORM_PERMISSIONS.VIEW_HEALTH), controller.getHealth.bind(controller));
  router.get('/profile', requirePermission(PLATFORM_PERMISSIONS.VIEW_PROFILE), controller.getProfile.bind(controller));

  return router;
}
