import { PolicyResult } from './policyResult.js';

export class OTPPolicy {
  evaluate({ otp, maxAttempts = 3, currentAttempt = 0 } = {}) {
    if (!otp) {
      return PolicyResult.invalid('otp-not-provided');
    }

    if (otp.status === 'expired' || otp.isExpired) {
      return PolicyResult.expired('otp-expired');
    }

    if (otp.status === 'verified' || otp.isVerified) {
      return PolicyResult.allowed({ verified: true });
    }

    if (currentAttempt >= maxAttempts) {
      return PolicyResult.denied('retry-limit-reached');
    }

    return PolicyResult.allowed({ verified: false, canRetry: true });
  }
}
