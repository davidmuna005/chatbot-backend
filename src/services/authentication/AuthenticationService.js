import { ServiceResult } from '../serviceResult.js';

const maskDestination = (destination) => {
  if (typeof destination !== 'string') {
    return null;
  }
  const suffix = destination.slice(-4);
  return `****${suffix}`;
};

export class AuthenticationService {
  constructor({ parentRepository, otpService, sessionService, notificationService, authenticationPolicy, logger, otpExpirationMinutes = 5, sessionExpirationMinutes = 60 } = {}) {
    this.parentRepository = parentRepository;
    this.otpService = otpService;
    this.sessionService = sessionService;
    this.notificationService = notificationService;
    this.authenticationPolicy = authenticationPolicy;
    this.logger = logger;
    this.otpExpirationMinutes = otpExpirationMinutes;
    this.sessionExpirationMinutes = sessionExpirationMinutes;
  }

  async requestOtp({ nationalId, phone } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'AuthenticationService', action: 'requestOtp' });

      if (!nationalId && !phone) {
        return ServiceResult.validationFailed('National ID or phone number is required');
      }

      const parent = nationalId
        ? await this.parentRepository?.findByIdNumber?.(nationalId)
        : await this.parentRepository?.findByPhone?.(phone);

      if (!parent) {
        return ServiceResult.notFound('Parent not found', {}, null, 'Parent not found', 'PARENT_NOT_FOUND');
      }

      const policyResult = this.authenticationPolicy?.evaluate?.({ parent, nationalId: nationalId ?? parent.idNumber, otp: { status: 'pending' } });
      if (!policyResult?.allowed) {
        return ServiceResult.failure(policyResult?.reason ?? 'authentication-denied', { parentId: parent.id }, policyResult, 'Authentication failed', 'AUTHENTICATION_FAILED');
      }

      const otpResult = await this.otpService?.generate?.({ parentId: parent.id, destination: parent.phone, method: 'sms', expiresInMinutes: this.otpExpirationMinutes });
      if (!otpResult?.success) {
        return otpResult;
      }

      const notificationResult = this.notificationService
        ? await this.notificationService.send({
            parentId: parent.id,
            channel: 'sms',
            message: `Your authentication OTP is ${otpResult.data.code}`
          })
        : ServiceResult.success(null, {}, null, 'Notification service not configured', 'NOTIFICATION_SERVICE_NOT_CONFIGURED');

      if (!notificationResult.success) {
        return ServiceResult.failure('notification-failed', { parentId: parent.id }, notificationResult?.decision, 'Failed to send OTP notification', 'NOTIFICATION_FAILED');
      }

      this.logger?.info?.('Service completed', { service: 'AuthenticationService', action: 'requestOtp' });
      return ServiceResult.success(
        {
          parentId: parent.id,
          destination: maskDestination(parent.phone),
          expiresAt: otpResult.data.expiresAt
        },
        { parentId: parent.id },
        policyResult,
        'OTP has been generated and sent',
        'OTP_REQUESTED'
      );
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AuthenticationService', action: 'requestOtp', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async authenticate({ nationalId, otpCode, parentId } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'AuthenticationService', action: 'authenticate' });

      if (!otpCode) {
        return ServiceResult.validationFailed('OTP code is required');
      }

      if (!parentId && !nationalId) {
        return ServiceResult.validationFailed('Parent ID or national ID is required');
      }

      const parent = nationalId
        ? await this.parentRepository?.findByIdNumber?.(nationalId)
        : parentId
        ? await this.parentRepository?.findByParentNumber?.(parentId) ?? await this.parentRepository?.findByPhone?.(parentId)
        : null;

      if (!parent) {
        return ServiceResult.notFound('Parent not found', {}, null, 'Parent not found', 'PARENT_NOT_FOUND');
      }

      const policyResult = this.authenticationPolicy?.evaluate?.({ parent, nationalId: nationalId ?? parent.idNumber, otp: { status: 'pending' } });
      if (!policyResult?.allowed) {
        return ServiceResult.failure(policyResult?.reason ?? 'authentication-denied', { parentId: parent.id }, policyResult, 'Authentication failed', 'AUTHENTICATION_FAILED');
      }

      const otpResult = await this.otpService?.validate?.({ parentId: parent.id, code: otpCode });
      if (!otpResult?.success) {
        return otpResult;
      }

      const sessionResult = await this.sessionService?.create?.({ parentId: parent.id, expiresInMinutes: this.sessionExpirationMinutes });
      if (!sessionResult?.success) {
        return sessionResult;
      }

      this.logger?.info?.('Service completed', { service: 'AuthenticationService', action: 'authenticate' });
      return ServiceResult.success(
        { parent, session: sessionResult.data },
        { parentId: parent.id },
        policyResult,
        'Authentication completed successfully',
        'AUTH_SUCCESS'
      );
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'AuthenticationService', action: 'authenticate', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
