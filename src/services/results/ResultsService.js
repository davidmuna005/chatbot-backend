import { ServiceResult } from '../serviceResult.js';

export class ResultsService {
  constructor({ resultsRepository, authorizationPolicy, logger } = {}) {
    this.resultsRepository = resultsRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getResults(payload = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'ResultsService', action: 'getResults' });
      const results = await this.resultsRepository?.getResults?.(payload);
      const decision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-results'] }, permission: 'view-results' });
      if (!decision?.allowed) {
        return ServiceResult.accessDenied(decision?.reason ?? 'results-access-denied', {}, decision);
      }
      this.logger?.info?.('Service completed', { service: 'ResultsService', action: 'getResults' });
      return ServiceResult.success(results, {}, decision, 'Results retrieved successfully', 'RESULTS_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'ResultsService', action: 'getResults', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
