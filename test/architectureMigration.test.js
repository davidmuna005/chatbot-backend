import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlatformArchitecture } from '../src/platform/index.js';

test('creates platform architecture with registry, gateway, router, and heartbeat services', () => {
  const architecture = createPlatformArchitecture({
    config: {
      environment: { NODE_ENV: 'test' },
      jwt: { secret: 'test-secret' },
      whatsapp: {}
    },
    logger: { info() {}, warn() {}, error() {} }
  });

  assert.ok(architecture.schoolRegistry);
  assert.ok(architecture.connectorRegistry);
  assert.ok(architecture.apiGateway);
  assert.ok(architecture.schoolRouter);
  assert.ok(architecture.heartbeatService);

  const school = architecture.schoolRegistry.registerSchool({
    id: 'school-001',
    name: 'Northview School',
    status: 'active',
    license: 'valid',
    apiUrl: 'https://school.example.com',
    apiKey: 'school-key',
    publicKey: 'public-key',
    connectorType: 'mysql',
    databaseType: 'mysql',
    version: '1.0.0'
  });

  assert.equal(school.id, 'school-001');
  assert.equal(architecture.schoolRegistry.findSchool('school-001')?.name, 'Northview School');
});
