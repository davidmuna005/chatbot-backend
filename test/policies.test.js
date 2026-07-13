import test from 'node:test';
import assert from 'node:assert/strict';

import { AuthenticationPolicy, AuthorizationPolicy, FormerStudentPolicy, OTPPolicy, SessionPolicy, TicketPolicy } from '../src/policies/index.js';

test('authentication policy returns consistent decisions for parent verification and otp state', () => {
  const policy = new AuthenticationPolicy();
  const denied = policy.evaluate({ parent: { verificationStatus: 'pending' }, nationalId: '1234' });
  const allowed = policy.evaluate({ parent: { verificationStatus: 'verified' }, nationalId: '1234', otp: { status: 'pending' } });

  assert.equal(denied.allowed, false);
  assert.equal(allowed.allowed, true);
});

test('authorization policy checks permission presence only', () => {
  const policy = new AuthorizationPolicy();
  const authorized = policy.evaluate({ user: { permissions: ['manage-users'] }, permission: 'manage-users' });
  const unauthorized = policy.evaluate({ user: { permissions: [] }, permission: 'manage-users' });

  assert.equal(authorized.allowed, true);
  assert.equal(unauthorized.allowed, false);
});

test('former student policy denies inactive student statuses', () => {
  const policy = new FormerStudentPolicy();
  const denied = policy.evaluate({ student: { status: 'graduated' } });
  const allowed = policy.evaluate({ student: { status: 'active' } });

  assert.equal(denied.allowed, false);
  assert.equal(allowed.allowed, true);
});

test('otp policy handles expiry and retry limits', () => {
  const policy = new OTPPolicy();
  const expired = policy.evaluate({ otp: { status: 'expired' } });
  const retryLimited = policy.evaluate({ otp: { status: 'pending' }, currentAttempt: 3, maxAttempts: 3 });

  assert.equal(expired.allowed, false);
  assert.equal(retryLimited.allowed, false);
});

test('session policy detects expired and revoked sessions', () => {
  const policy = new SessionPolicy();
  const revoked = policy.evaluate({ session: { status: 'revoked' } });
  const expired = policy.evaluate({ session: { status: 'active', expiresAt: '2000-01-01T00:00:00.000Z' }, now: new Date('2026-01-01T00:00:00.000Z') });

  assert.equal(revoked.allowed, false);
  assert.equal(expired.allowed, false);
});

test('ticket policy decides edit, close, and upload rules', () => {
  const policy = new TicketPolicy();
  const closedEdit = policy.evaluate({ ticket: { status: 'closed' }, action: 'edit' });
  const upload = policy.evaluate({ ticket: { status: 'open' }, action: 'upload-documents', hasDocuments: true });

  assert.equal(closedEdit.allowed, false);
  assert.equal(upload.allowed, true);
});
