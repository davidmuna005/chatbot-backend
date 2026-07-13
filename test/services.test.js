import test from 'node:test';
import assert from 'node:assert/strict';

import { AuthenticationService } from '../src/services/authentication/AuthenticationService.js';
import { StudentService } from '../src/services/student/StudentService.js';
import { OTPService } from '../src/services/otp/OTPService.js';
import { SessionService } from '../src/services/session/SessionService.js';
import { TicketService } from '../src/services/tickets/TicketService.js';
import { AnalyticsService } from '../src/services/analytics/AnalyticsService.js';

test('authentication service composes repository and policy results into a service result', async () => {
  const authenticationService = new AuthenticationService({
    parentRepository: { findByIdNumber: async () => ({ verificationStatus: 'verified' }) },
    otpService: { validate: async () => ({ success: true, data: { verified: true } }) },
    sessionService: { create: async () => ({ success: true, data: { id: 's1' } }) },
    authenticationPolicy: { evaluate: () => ({ allowed: true }) },
    logger: { info() {}, error() {} }
  });

  const result = await authenticationService.authenticate({ nationalId: '1234', otpCode: '1111', parentId: 'p1' });
  assert.equal(result.success, true);
  assert.equal(result.data.session.id, 's1');
});

test('student service blocks former students through policy decision', async () => {
  const studentService = new StudentService({
    studentRepository: { findByStudentId: async () => ({ status: 'graduated' }) },
    formerStudentPolicy: { evaluate: () => ({ allowed: false, reason: 'former-student' }) },
    logger: { info() {}, error() {} }
  });

  const result = await studentService.getStudent({ studentId: 's1' });
  assert.equal(result.success, false);
  assert.equal(result.error, 'student-access-denied');
});

test('otp service validates through policy and repository', async () => {
  const otpService = new OTPService({
    otpRepository: { findLatest: async () => ({ attempts: 0 }) },
    otpPolicy: { evaluate: () => ({ allowed: true }) },
    logger: { info() {}, error() {} }
  });

  const result = await otpService.validate({ parentId: 'p1', code: '2222' });
  assert.equal(result.success, true);
});

test('ticket service enforces ticket policy before persistence', async () => {
  const ticketService = new TicketService({
    ticketRepository: { create: async () => ({ id: 't1' }) },
    ticketPolicy: { evaluate: () => ({ allowed: true }) },
    logger: { info() {}, error() {} }
  });

  const result = await ticketService.create({ subject: 'Help' });
  assert.equal(result.success, true);
  assert.equal(result.data.id, 't1');
});

test('analytics service aggregates repository data', async () => {
  const analyticsService = new AnalyticsService({
    auditRepository: { search: async () => [{ id: 1 }] },
    notificationRepository: { search: async () => [{ id: 1 }, { id: 2 }] },
    sessionRepository: { find: async () => [{ id: 1 }, { id: 2 }, { id: 3 }] },
    logger: { info() {}, error() {} }
  });

  const result = await analyticsService.getDashboardMetrics();
  assert.equal(result.success, true);
  assert.equal(result.data.auditCount, 1);
  assert.equal(result.data.notificationCount, 2);
  assert.equal(result.data.sessionCount, 3);
});
