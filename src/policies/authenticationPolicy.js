import { PolicyResult } from './policyResult.js';

export class AuthenticationPolicy {
  evaluate({ parent, nationalId, otp, locked = false, otpAttempts = 0, maxOtpAttempts = 3 } = {}) {
    if (!parent) {
      return PolicyResult.denied('parent-not-found');
    }

    if (!nationalId || typeof nationalId !== 'string' || nationalId.trim().length < 4) {
      return PolicyResult.invalid('invalid-national-id');
    }

    if (parent.verificationStatus !== 'verified') {
      return PolicyResult.denied('parent-not-verified');
    }

    if (locked) {
      return PolicyResult.denied('account-locked');
    }

    if (!otp) {
      return PolicyResult.invalid('otp-missing');
    }

    if (otpAttempts > maxOtpAttempts) {
      return PolicyResult.denied('otp-attempt-limit-exceeded');
    }

    if (otp.status === 'expired' || otp.isExpired) {
      return PolicyResult.expired('otp-expired');
    }

    if (otp.status === 'verified' || otp.isVerified) {
      return PolicyResult.allowed({ verified: true });
    }

    return PolicyResult.allowed({ verified: false });
  }
}
