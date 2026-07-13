import { ServiceResult } from '../serviceResult.js';

export class OTPService {
  constructor({ otpRepository, otpPolicy, logger } = {}) {
    this.otpRepository = otpRepository;
    this.otpPolicy = otpPolicy;
    this.logger = logger;
  }

  async generate({ destination, method = 'sms' }) {
    try {
      this.logger?.info?.('Service started', { service: 'OTPService', action: 'generate' });
      const otp = await this.otpRepository?.create?.({ destination, method });
      this.logger?.info?.('Service completed', { service: 'OTPService', action: 'generate' });
      return ServiceResult.success(otp, {}, null, 'OTP generated successfully', 'OTP_GENERATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'OTPService', action: 'generate', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async validate({ parentId, code }) {
    try {
      const otp = await this.otpRepository?.findLatest?.({ parentId });
      const decision = this.otpPolicy?.evaluate?.({ otp, currentAttempt: otp?.attempts ?? 0 });
      if (!decision?.allowed) {
        return ServiceResult.failure(decision?.reason ?? 'otp-invalid', {}, decision, decision?.reason ?? 'OTP validation failed', decision?.code ?? 'OTP_INVALID');
      }

      return ServiceResult.success({ verified: true }, {}, decision, 'OTP validated successfully', 'OTP_VALIDATED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async expire({ parentId }) {
    try {
      await this.otpRepository?.expire?.({ parentId });
      return ServiceResult.success({ expired: true }, {}, null, 'OTP expired successfully', 'OTP_EXPIRED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }
}
