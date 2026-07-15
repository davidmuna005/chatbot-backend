import { ServiceResult } from '../serviceResult.js';

export class SessionService {
  constructor({ sessionRepository, sessionPolicy, logger } = {}) {
    this.sessionRepository = sessionRepository;
    this.sessionPolicy = sessionPolicy;
    this.logger = logger;
  }

  async create({ parentId, expiresInMinutes = 60 } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'SessionService', action: 'create' });
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();
      const session = await this.sessionRepository?.create?.({
        parentId,
        status: 'active',
        createdAt: now.toISOString(),
        lastActivityAt: now.toISOString(),
        expiresAt
      });
      this.logger?.info?.('Service completed', { service: 'SessionService', action: 'create' });
      return ServiceResult.success(session, {}, null, 'Session created successfully', 'SESSION_CREATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'SessionService', action: 'create', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async retrieve({ sessionId }) {
    try {
      const session = await this.sessionRepository?.find?.({ sessionId });
      if (!session) {
        return ServiceResult.notFound('Session not found', {}, null, 'Session not found', 'SESSION_NOT_FOUND');
      }
      return ServiceResult.success(session, {}, null, 'Session retrieved successfully', 'SESSION_RETRIEVED');
    } catch (error) {
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

  async refresh({ sessionId, extendMinutes = 30 } = {}) {
    try {
      const result = await this.validate({ sessionId });
      if (!result.success) {
        return result;
      }

      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + extendMinutes * 60 * 1000).toISOString();
      const session = await this.sessionRepository?.update?.({ sessionId, lastActivityAt: now.toISOString(), expiresAt: newExpiresAt });
      return ServiceResult.success(session, {}, null, 'Session refreshed successfully', 'SESSION_REFRESHED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async expire({ sessionId }) {
    try {
      const session = await this.sessionRepository?.find?.({ sessionId });
      if (!session) {
        return ServiceResult.notFound('Session not found', {}, null, 'Session not found', 'SESSION_NOT_FOUND');
      }
      await this.sessionRepository?.invalidate?.({ sessionId });
      return ServiceResult.success({ sessionId, expired: true }, {}, null, 'Session expired successfully', 'SESSION_EXPIRED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async destroy({ sessionId }) {
    try {
      await this.sessionRepository?.delete?.({ sessionId });
      return ServiceResult.success({ sessionId, destroyed: true }, {}, null, 'Session destroyed successfully', 'SESSION_DESTROYED');
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
