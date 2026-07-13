import { ServiceResult } from '../serviceResult.js';

export class SessionService {
  constructor({ sessionRepository, sessionPolicy, logger } = {}) {
    this.sessionRepository = sessionRepository;
    this.sessionPolicy = sessionPolicy;
    this.logger = logger;
  }

  async create({ parentId }) {
    try {
      this.logger?.info?.('Service started', { service: 'SessionService', action: 'create' });
      const session = await this.sessionRepository?.create?.({ parentId });
      this.logger?.info?.('Service completed', { service: 'SessionService', action: 'create' });
      return ServiceResult.success(session, {}, null, 'Session created successfully', 'SESSION_CREATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'SessionService', action: 'create', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async validate({ sessionId }) {
    try {
      const session = await this.sessionRepository?.find?.({ sessionId });
      const decision = this.sessionPolicy?.evaluate?.({ session });
      if (!decision?.allowed) {
        return ServiceResult.failure(decision?.reason ?? 'session-invalid', {}, decision, decision?.reason ?? 'Session validation failed', decision?.code ?? 'SESSION_INVALID');
      }
      return ServiceResult.success(session, {}, decision, 'Session is valid', 'SESSION_VALID');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async invalidate({ sessionId }) {
    try {
      await this.sessionRepository?.invalidate?.({ sessionId });
      return ServiceResult.success({ invalidated: true }, {}, null, 'Session invalidated successfully', 'SESSION_INVALIDATED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }
}
