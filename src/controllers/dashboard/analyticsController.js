import { AnalyticsService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class AnalyticsController {
  constructor(dependencies = {}) {
    this.analyticsService = dependencies.analyticsService || new AnalyticsService(dependencies);
  }

  async overview(req, res, next) {
    try {
      const result = await (typeof this.analyticsService.getOverview === 'function'
        ? this.analyticsService.getOverview(req.query)
        : typeof this.analyticsService.getDashboardMetrics === 'function'
          ? this.analyticsService.getDashboardMetrics(req.query)
          : ServiceResult.failure('Analytics overview not implemented', {}, null, 'Analytics overview not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async dashboard(req, res, next) {
    try {
      const result = await (typeof this.analyticsService.getDashboard === 'function'
        ? this.analyticsService.getDashboard(req.query)
        : typeof this.analyticsService.getDashboardMetrics === 'function'
          ? this.analyticsService.getDashboardMetrics(req.query)
          : ServiceResult.failure('Analytics dashboard not implemented', {}, null, 'Analytics dashboard not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
