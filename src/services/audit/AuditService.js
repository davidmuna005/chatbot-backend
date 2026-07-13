import { ServiceResult } from '../serviceResult.js';

export class AuditService {
  constructor({ auditRepository, logger } = {}) {
    this.auditRepository = auditRepository;
    this.logger = logger;
  }

  async record(payload = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'AuditService', action: 'record' });
      const result = await this.auditRepository?.create?.(payload);
      this.logger?.info?.('Service completed', { service: 'AuditService', action: 'record' });
      return ServiceResult.success(result, {}, null, 'Audit entry recorded', 'AUDIT_RECORDED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AuditService', action: 'record', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
