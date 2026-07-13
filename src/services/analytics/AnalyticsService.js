import { ServiceResult } from '../serviceResult.js';

export class AnalyticsService {
  constructor({ auditRepository, notificationRepository, sessionRepository, logger } = {}) {
    this.auditRepository = auditRepository;
    this.notificationRepository = notificationRepository;
    this.sessionRepository = sessionRepository;
    this.logger = logger;
  }

  async getDashboardMetrics() {
    try {
      this.logger?.info?.('Service started', { service: 'AnalyticsService', action: 'getDashboardMetrics' });
      const audits = await this.auditRepository?.search?.({});
      const notifications = await this.notificationRepository?.search?.({});
      const sessions = await this.sessionRepository?.find?.({});
      const metrics = {
        auditCount: Array.isArray(audits) ? audits.length : 0,
        notificationCount: Array.isArray(notifications) ? notifications.length : 0,
        sessionCount: Array.isArray(sessions) ? sessions.length : 0
      };
      this.logger?.info?.('Service completed', { service: 'AnalyticsService', action: 'getDashboardMetrics' });
      return ServiceResult.success(metrics, {}, null, 'Analytics metrics prepared', 'ANALYTICS_READY');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AnalyticsService', action: 'getDashboardMetrics', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
