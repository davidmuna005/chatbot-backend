import { ServiceResult } from '../serviceResult.js';

const generateNumericCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
};

export class OTPService {
  constructor({ otpRepository, otpPolicy, logger, maxAttempts = 3 } = {}) {
    this.otpRepository = otpRepository;
    this.otpPolicy = otpPolicy;
    this.logger = logger;
    this.maxAttempts = maxAttempts;
  }

  async generate({ parentId, destination, method = 'sms', expiresInMinutes = 5 } = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'OTPService', action: 'generate' });

      if (!parentId || !destination) {
        return ServiceResult.validationFailed('Parent ID and destination are required to generate OTP');
      }

      const code = generateNumericCode();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();
      const otpRecord = await this.otpRepository?.create?.({
        parentId,
        destination,
        method,
        code,
        status: 'pending',
        attempts: 0,
        createdAt: now.toISOString(),
        expiresAt
      });

      this.logger?.info?.('Service completed', { service: 'OTPService', action: 'generate', parentId });
      return ServiceResult.success({ ...otpRecord, code, expiresAt }, {}, null, 'OTP generated successfully', 'OTP_GENERATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'OTPService', action: 'generate', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async validate({ parentId, code } = {}) {
    try {
      if (!parentId || !code) {
        return ServiceResult.validationFailed('Parent ID and OTP code are required');
      }

      const otp = await this.otpRepository?.findLatest?.({ parentId });
      if (!otp) {
        return ServiceResult.notFound('OTP not found', {}, null, 'OTP not found for the provided parent', 'OTP_NOT_FOUND');
      }

      const now = new Date();
      const expiresAt = otp.expiresAt ? new Date(otp.expiresAt) : null;
      const isExpired = expiresAt ? expiresAt <= now : false;

      if (otp.status === 'verified' || otp.isVerified) {
        return ServiceResult.failure('otp-already-used', {}, null, 'OTP has already been used', 'OTP_ALREADY_USED');
      }

      if (isExpired || otp.status === 'expired') {
        await this.otpRepository?.expire?.({ parentId, otpId: otp.id });
        return ServiceResult.failure('otp-expired', {}, null, 'OTP has expired', 'OTP_EXPIRED');
      }

      const attempts = Number(otp.attempts ?? 0) + 1;
      if (otp.code && otp.code !== code) {
        const updated = await this.otpRepository?.update?.({ parentId, otpId: otp.id, attempts });
        const decision = this.otpPolicy?.evaluate?.({ otp: { ...otp, attempts: updated?.attempts ?? attempts }, currentAttempt: attempts, maxAttempts: this.maxAttempts });

        if (!decision?.allowed) {
          await this.otpRepository?.expire?.({ parentId, otpId: otp.id });
          return ServiceResult.failure(decision?.reason ?? 'otp-max-attempts-exceeded', {}, decision, 'OTP retry limit exceeded', decision?.code ?? 'OTP_RETRY_LIMIT_EXCEEDED');
        }

        return ServiceResult.failure('otp-invalid', { attempts: updated?.attempts ?? attempts }, null, 'OTP code is invalid', 'OTP_INVALID');
      }

      const verifiedOtp = await this.otpRepository?.update?.({ parentId, otpId: otp.id, status: 'verified', verifiedAt: now.toISOString(), attempts });
      this.logger?.info?.('OTP validated', { parentId, otpId: otp.id });
      return ServiceResult.success({ verified: true, otp: verifiedOtp }, {}, null, 'OTP validated successfully', 'OTP_VALIDATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'OTPService', action: 'validate', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async expire({ parentId, otpId } = {}) {
    try {
      if (!parentId && !otpId) {
        return ServiceResult.validationFailed('Parent ID or OTP ID is required to expire OTP');
      }
      await this.otpRepository?.expire?.({ parentId, otpId });
      return ServiceResult.success({ expired: true }, {}, null, 'OTP expired successfully', 'OTP_EXPIRED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'OTPService', action: 'expire', error: error.message });
      return ServiceResult.fromError(error);
    }
  }
}
