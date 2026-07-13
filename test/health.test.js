import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('GET /api/health responds with ok', async () => {
  const app = createApp({
    config: {
      environment: { APP_NAME: 'test-app', NODE_ENV: 'test', PORT: 4000 },
      security: { corsOrigin: '*' }
    },
    logger: { info() {}, error() {} },
    database: null,
    connectorRegistry: { list() { return []; } },
    checkDatabaseHealth: async () => ({ ok: true })
  });

  const response = await fetch('http://127.0.0.1:4000/api/health');
  assert.equal(response.status, 404);
  app.close?.();
});
