import test from 'node:test';
import assert from 'node:assert/strict';

import { createSchoolOnboardingService } from '../src/services/schoolOnboardingService.js';
import { createSchoolRegistry } from '../src/platform/schoolRegistry.js';

test('school onboarding service completes registration, validation, schema discovery, and activation', async () => {
  const registry = createSchoolRegistry();
  const schoolServerApi = {
    async onboardSchool(payload) {
      return { success: true, data: { schoolId: payload.schoolId, connectorType: payload.connectorType, status: 'ready-for-validation' } };
    },
    async validateConnection(payload) {
      return { success: true, data: { connectorType: payload.connectorType, databaseName: payload.databaseName, status: 'validated' } };
    },
    async discoverSchema(payload) {
      return { success: true, data: { connectorType: payload.connectorType, tables: ['students', 'parents'], collections: ['students'] } };
    },
    async activateConnector(payload) {
      return { success: true, data: { schoolId: payload.schoolId, connectorType: payload.connectorType, status: 'activated' } };
    }
  };

  const service = createSchoolOnboardingService({ schoolRegistry: registry, schoolServerApi, logger: { info() {}, error() {} } });

  const registration = await service.registerSchool({
    name: 'Riverstone Academy',
    adminEmail: 'admin@riverstone.edu',
    apiUrl: 'https://riverstone.example.com',
    connectorType: 'postgresql'
  });

  assert.equal(registration.success, true);
  assert.equal(registration.data.school.name, 'Riverstone Academy');
  assert.equal(registration.data.school.connectorStatus, 'testing');

  const schoolId = registration.data.school.id;

  const validation = await service.testConnector(schoolId, { databaseName: 'riverstone_sis' });
  assert.equal(validation.success, true);
  assert.equal(validation.data.connectorType, 'postgresql');

  const discovery = await service.discoverSchema(schoolId);
  assert.equal(discovery.success, true);
  assert.deepEqual(discovery.data.discovery.tables, ['students', 'parents']);

  const activation = await service.activateConnector(schoolId);
  assert.equal(activation.success, true);
  assert.equal(activation.data.connectorStatus, 'connected');

  const heartbeat = await service.getHeartbeat(schoolId);
  assert.equal(heartbeat.success, true);
  assert.equal(heartbeat.data.status, 'online');

  const monitoring = await service.getMonitoring(schoolId);
  assert.equal(monitoring.success, true);
  assert.equal(monitoring.data.monitoringStatus, 'healthy');
});
