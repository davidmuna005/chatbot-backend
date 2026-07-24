import test from 'node:test';
import assert from 'node:assert/strict';

import { AuthenticationService } from '../src/services/authentication/AuthenticationService.js';
import { StudentService as StudentPortalService } from '../src/services/student/StudentService.js';
import { OTPService } from '../src/services/otp/OTPService.js';
import { SessionService } from '../src/services/session/SessionService.js';
import { TicketService } from '../src/services/tickets/TicketService.js';
import { AnalyticsService } from '../src/services/analytics/AnalyticsService.js';
import { ParentService } from '../src/services/parentService.js';
import { StudentService } from '../src/services/studentService.js';
import { StudentRepository } from '../src/repositories/StudentRepository.js';
import { ParentRepository } from '../src/repositories/ParentRepository.js';
import { DashboardService } from '../src/services/dashboardService.js';
import { verifyToken } from '../src/middleware/rbac.js';
import { PlatformAdminService } from '../src/services/platformAdminService.js';

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
  const studentService = new StudentPortalService({
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

test('parent service returns connector-backed parent records with admin-friendly fields', async () => {
  const parentService = new ParentService({
    connectorRegistry: { getActiveConnector: () => ({}) },
    logger: { info() {}, error() {} },
    parentRepository: {
      findByPhone: async () => ({ id: 'p1', name: 'Ada Lovelace', phone: '555', status: 'Active', linkedStudents: [{ id: 's1' }] }),
      findByParentNumber: async () => ({ id: 'p1', name: 'Ada Lovelace', phone: '555', status: 'Active', linkedStudents: [{ id: 's1' }] }),
      findLinkedStudents: async () => [{ id: 's1', studentId: 's1' }],
      update: async () => ({ success: true })
    }
  });

  const result = await parentService.searchParents({ searchTerm: 'ada' });
  assert.equal(result.success, true);
  assert.equal(result.data[0].name, 'Ada Lovelace');
  assert.equal(result.data[0].status, 'active');
});

test('student service returns connector-backed student profiles for the admin portal', async () => {
  const studentService = new StudentService({
    connectorRegistry: { getActiveConnector: () => ({}) },
    logger: { info() {}, error() {} },
    studentRepository: {
      getProfile: async () => ({ studentId: 's1', name: 'Grace Hopper', admissionNumber: 'A100', status: 'Active' }),
      getStudent: async () => ({ studentId: 's1', status: 'Active' }),
      create: async () => ({ id: 's1' }),
      update: async () => ({ id: 's1' })
    }
  });

  const result = await studentService.getStudentProfile('s1');
  assert.equal(result.success, true);
  assert.equal(result.data.name, 'Grace Hopper');
  assert.equal(result.data.admissionNo, 'A100');
});

test('student search surfaces the linked parent name for the admin students list', async () => {
  const studentService = new StudentService({
    connectorRegistry: { getActiveConnector: () => ({}) },
    logger: { info() {}, error() {} },
    studentRepository: {
      search: async () => [{
        studentId: 'S001',
        name: 'Kelvin Otieno',
        admissionNumber: 'GVSS001',
        status: 'Active',
        linkedParents: [{ name: 'Moses Waweru' }]
      }],
      getProfile: async () => ({ studentId: 's1', name: 'Grace Hopper', admissionNumber: 'A100', status: 'Active' }),
      getStudent: async () => ({ studentId: 's1', status: 'Active' }),
      create: async () => ({ id: 's1' }),
      update: async () => ({ id: 's1' })
    }
  });

  const result = await studentService.searchStudents({ searchTerm: 'kelvin' });
  assert.equal(result.success, true);
  assert.equal(result.data[0].parent, 'Moses Waweru');
});

test('student repository falls back to green valley seed data for search and profiles', async () => {
  const repository = new StudentRepository({ logger: { info() {}, error() {} } });

  const students = await repository.search({ searchTerm: 'kelvin' });
  assert.equal(students.length, 1);
  assert.equal(students[0].name, 'Kelvin Otieno');
  assert.equal(students[0].parentId, 'P001');
  assert.equal(students[0].parent, 'Moses Waweru');

  const profile = await repository.getProfile('S001');
  assert.equal(profile.name, 'Kelvin Otieno');
  assert.equal(profile.admissionNumber, 'GVSS001');
  assert.equal(profile.parent, 'Moses Waweru');
});

test('dashboard service exposes school fixture counts for parents, students, tickets, and connectors', async () => {
  const service = new DashboardService({ logger: { info() {}, error() {} } });
  const result = await service.getOverview();

  assert.equal(result.success, true);
  assert.equal(result.data.totalParents, 50);
  assert.equal(result.data.totalStudents, 32);
  assert.equal(result.data.openTickets, 1);
  assert.equal(result.data.totalConnectors, 1);
});

test('verifyToken accepts the school portal demo token and populates the request user', async () => {
  const req = { headers: { authorization: 'Bearer school-admin-session' } };
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  let nextCalled = false;
  verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.role, 'principal');
  assert.equal(req.user.permissions.includes('students:view'), true);
});

test('platform admin service exposes green valley students and parents from the connector fixture', async () => {
  const service = new PlatformAdminService({ logger: { info() {}, error() {} } });

  const students = await service.getStudents({ search: 'kelvin' });
  assert.equal(students.length, 1);
  assert.equal(students[0].name, 'Kelvin Otieno');

  const parents = await service.getParents({ search: 'moses' });
  assert.equal(parents.length, 1);
  assert.equal(parents[0].name, 'Moses Waweru');
});

test('platform admin dashboard overview derives its values from the connected school fixture', async () => {
  const service = new PlatformAdminService({ logger: { info() {}, error() {} } });
  const result = await service.getDashboardOverview();

  assert.equal(result.overview.schools, 1);
  assert.equal(result.overview.activeSchools, 1);
  assert.equal(result.overview.offlineSchools, 0);
  assert.equal(result.overview.connectedDatabases, 1);
  assert.equal(result.overview.activeLicenses, 1);
  assert.equal(result.overview.ticketsToday, 3);
});

test('parent repository falls back to green valley seed data for search and linked students', async () => {
  const repository = new ParentRepository({ logger: { info() {}, error() {} } });

  const parents = await repository.search({ searchTerm: 'moses' });
  assert.equal(parents.length, 1);
  assert.equal(parents[0].name, 'Moses Waweru');

  const linkedStudents = await repository.findLinkedStudents('P001');
  assert.equal(linkedStudents.length, 2);
  assert.ok(linkedStudents.some((student) => student.admissionNumber === 'GVSS001'));
  assert.ok(linkedStudents.some((student) => student.admissionNumber === 'GVSS002'));
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
