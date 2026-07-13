export class PolicyResult {
  constructor({ allowed = false, reason = 'denied', code = 'DENIED', details = {} } = {}) {
    this.allowed = allowed;
    this.reason = reason;
    this.code = code;
    this.details = details;
  }

  static allowed(details = {}) {
    return new PolicyResult({ allowed: true, reason: 'allowed', code: 'ALLOWED', details });
  }

  static denied(reason = 'denied', details = {}) {
    return new PolicyResult({ allowed: false, reason, code: 'DENIED', details });
  }

  static invalid(reason = 'invalid', details = {}) {
    return new PolicyResult({ allowed: false, reason, code: 'INVALID', details });
  }

  static expired(reason = 'expired', details = {}) {
    return new PolicyResult({ allowed: false, reason, code: 'EXPIRED', details });
  }

  static authorized(details = {}) {
    return new PolicyResult({ allowed: true, reason: 'authorized', code: 'AUTHORIZED', details });
  }

  static unauthorized(reason = 'unauthorized', details = {}) {
    return new PolicyResult({ allowed: false, reason, code: 'UNAUTHORIZED', details });
  }
}
