import test from 'node:test';
import assert from 'node:assert/strict';

import { User, Role, Permission, Parent, Student, Session, OTP, Ticket, Notification, AuditLog, Configuration, ServiceRequest } from '../src/models/index.js';

test('application domain models construct with default metadata and relationships', () => {
  const user = new User({ username: 'admin' });
  const role = new Role({ name: 'Administrator' });
  const permission = new Permission({ slug: 'manage-users' });
  const parent = new Parent({ phone: '0712345678' });
  const student = new Student({ admissionNumber: 'A100' });
  const session = new Session({ sessionId: 'sess-1' });
  const otp = new OTP({ reference: 'otp-1' });
  const ticket = new Ticket({ subject: 'Update phone' });
  const notification = new Notification({ subject: 'Welcome' });
  const auditLog = new AuditLog({ action: 'create' });
  const configuration = new Configuration({ key: 'system.name' });
  const serviceRequest = new ServiceRequest({ type: 'attendance' });

  assert.equal(user.status, 'active');
  assert.equal(role.permissions.length, 0);
  assert.equal(permission.slug, 'manage-users');
  assert.equal(parent.verificationStatus, 'pending');
  assert.equal(student.status, 'active');
  assert.equal(session.status, 'active');
  assert.equal(otp.method, 'sms');
  assert.equal(ticket.category, 'general');
  assert.equal(notification.channel, 'whatsapp');
  assert.equal(auditLog.result, 'success');
  assert.equal(configuration.category, 'system');
  assert.equal(serviceRequest.status, 'pending');
});
