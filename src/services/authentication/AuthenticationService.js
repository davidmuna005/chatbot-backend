import { ServiceResult } from '../serviceResult.js';

export class AuthenticationService {
  constructor({ parentRepository, otpService, sessionService, authenticationPolicy, logger } = {}) {
    this.parentRepository = parentRepository;
    this.otpService = otpService;
    this.sessionService = sessionService;
    this.authenticationPolicy = authenticationPolicy;
    this.logger = logger;
  }

  async authenticate({ nationalId, otpCode, parentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'AuthenticationService', action: 'authenticate' });

      const parent = await this.parentRepository?.findByIdNumber?.(nationalId) ?? await this.parentRepository?.findByPhone?.(nationalId);
      const policyResult = this.authenticationPolicy?.evaluate?.({ parent, nationalId, otp: { status: 'pending' } });

      if (!policyResult?.allowed) {
        return ServiceResult.accessDenied(policyResult?.reason ?? 'authentication-denied', { parentId }, policyResult);
      }

      const otpResult = await this.otpService?.validate?.({ parentId, code: otpCode });
      if (!otpResult?.success) {
        return ServiceResult.failure(otpResult?.error ?? 'otp-validation-failed', { parentId }, otpResult?.decision, otpResult?.message ?? 'OTP validation failed', otpResult?.code ?? 'OTP_FAILED');
      }

      const sessionResult = await this.sessionService?.create?.({ parentId });
      if (!sessionResult?.success) {
        return ServiceResult.failure(sessionResult?.error ?? 'session-creation-failed', { parentId }, sessionResult?.decision, sessionResult?.message ?? 'Session creation failed', sessionResult?.code ?? 'SESSION_FAILED');
      }

      this.logger?.info?.('Service completed', { service: 'AuthenticationService', action: 'authenticate' });
      return ServiceResult.success({ parent, session: sessionResult.data }, { parentId }, policyResult, 'Authentication completed successfully', 'AUTH_SUCCESS');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AuthenticationService', action: 'authenticate', error: error.message });
      return ServiceResult.fromError(error, { parentId });
    }
  }
}
