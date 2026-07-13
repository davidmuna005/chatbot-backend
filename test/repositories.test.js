import test from 'node:test';
import assert from 'node:assert/strict';

import { ParentRepository } from '../src/repositories/ParentRepository.js';
import { StudentRepository } from '../src/repositories/StudentRepository.js';
import { SessionRepository } from '../src/repositories/SessionRepository.js';
import { NotificationRepository } from '../src/repositories/NotificationRepository.js';
import { RepositoryError } from '../src/repositories/errors.js';

test('parent repository delegates to the connector and normalizes results', async () => {
  const connector = {
    async getParent(payload) {
      return { idNumber: payload.idNumber, phone: '0712345678', linkedStudents: [{ id: 'S1' }] };
    }
  };

  const repository = new ParentRepository({ connector, logger: { info() {}, warn() {}, error() {}, debug() {} } });
  const parent = await repository.findByIdNumber('P001');

  assert.equal(parent.idNumber, 'P001');
  assert.equal(parent.phone, '0712345678');
  assert.equal(parent.linkedStudents.length, 1);
});

test('student repository returns a normalized profile object', async () => {
  const connector = {
    async getStudentProfile(payload) {
      return { studentId: payload.studentId, admissionNumber: 'A100', status: 'Active' };
    }
  };

  const repository = new StudentRepository({ connector, logger: { info() {}, warn() {}, error() {}, debug() {} } });
  const profile = await repository.getProfile('S001');

  assert.equal(profile.studentId, 'S001');
  assert.equal(profile.admissionNumber, 'A100');
});

test('session repository translates connector failures to repository errors', async () => {
  const connector = {
    async execute() {
      throw new Error('connection unavailable');
    }
  };

  const repository = new SessionRepository({ connector, logger: { info() {}, warn() {}, error() {}, debug() {} } });

  await assert.rejects(() => repository.create({ userId: 'U1' }), (error) => {
    assert.ok(error instanceof RepositoryError);
    return true;
  });
});

test('notification repository can search and return normalized records', async () => {
  const connector = {
    async execute(payload) {
      return [
        { id: 'N1', recipient: payload.filter.userId, channel: 'whatsapp' }
      ];
    }
  };

  const repository = new NotificationRepository({ connector, logger: { info() {}, warn() {}, error() {}, debug() {} } });
  const notifications = await repository.search({ userId: 'U1' });

  assert.equal(notifications[0].recipient, 'U1');
});
