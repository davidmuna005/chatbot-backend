import { ServiceResult } from '../serviceResult.js';

export class DisciplineService {
  constructor({ disciplineRepository, authorizationPolicy, logger } = {}) {
    this.disciplineRepository = disciplineRepository;
    this.authorizationPolicy = authorizationPolicy;
    this.logger = logger;
  }

  async getDiscipline(payload = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'DisciplineService', action: 'getDiscipline' });
      const discipline = await this.disciplineRepository?.getDiscipline?.(payload);
      const decision = this.authorizationPolicy?.evaluate?.({ user: { permissions: ['view-discipline'] }, permission: 'view-discipline' });
      if (!decision?.allowed) {
        return ServiceResult.accessDenied(decision?.reason ?? 'discipline-access-denied', {}, decision);
      }
      this.logger?.info?.('Service completed', { service: 'DisciplineService', action: 'getDiscipline' });
      return ServiceResult.success(discipline, {}, decision, 'Discipline retrieved successfully', 'DISCIPLINE_FOUND');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'DisciplineService', action: 'getDiscipline', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
