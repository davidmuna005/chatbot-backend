import { PolicyResult } from './policyResult.js';

export class SessionPolicy {
  evaluate({ session, now = new Date(), inactivityMinutes = 30 } = {}) {
    if (!session) {
      return PolicyResult.denied('session-not-provided');
    }

    if (session.status === 'revoked' || session.status === 'invalidated') {
      return PolicyResult.denied('session-revoked');
    }

    if (session.status !== 'active') {
      return PolicyResult.denied('session-inactive');
    }

    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
    if (expiresAt && expiresAt <= now) {
      return PolicyResult.expired('session-expired');
    }

    const lastActivityAt = session.lastActivityAt ? new Date(session.lastActivityAt) : null;
    if (lastActivityAt) {
      const elapsedMinutes = (now - lastActivityAt) / (1000 * 60);
      if (elapsedMinutes > inactivityMinutes) {
        return PolicyResult.denied('session-inactive-timeout');
      }
    }

    return PolicyResult.allowed({ valid: true });
  }
}
