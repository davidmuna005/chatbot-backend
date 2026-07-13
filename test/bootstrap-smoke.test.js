import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('createApp boots a valid Express app', () => {
  const app = createApp({
    config: {
      environment: { APP_NAME: 'test-app', NODE_ENV: 'test', PORT: 4000, APP_VERSION: '1.0.0', BUILD_TIME: 'test' },
      security: { corsOrigin: '*' }
    },
    logger: { info() {}, error() {}, warn() {}, http() {} },
    database: null,
    connectorRegistry: { list() { return []; } },
    checkDatabaseHealth: async () => ({ ok: true })
  });

  assert.ok(app, 'app should be created');
  assert.equal(typeof app.handle, 'function', 'app should expose Express handler');
});
