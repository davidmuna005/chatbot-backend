import { PolicyResult } from './policyResult.js';

export class FormerStudentPolicy {
  evaluate({ student, status } = {}) {
    const resolvedStatus = status ?? student?.status;
    const inactiveStatuses = ['completed', 'transferred', 'graduated', 'expelled', 'archived', 'inactive', 'dropped'];

    if (!student) {
      return PolicyResult.denied('student-not-provided');
    }

    if (inactiveStatuses.includes(String(resolvedStatus).toLowerCase())) {
      return PolicyResult.denied('former-student');
    }

    return PolicyResult.allowed({ current: true, status: resolvedStatus });
  }
}
