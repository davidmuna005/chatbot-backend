import test from 'node:test';
import assert from 'node:assert/strict';
import analyticsRouter from '../src/routes/analytics.js';
import authRouter from '../src/routes/auth.js';
import connectorsRouter from '../src/routes/connectors.js';
import eventsRouter from '../src/routes/events.js';
import createWebhookRouter from '../src/routes/webhook/index.js';

test('route modules are valid express routers', () => {
  assert.ok(analyticsRouter, 'analytics router missing');
  assert.ok(authRouter, 'auth router missing');
  assert.ok(connectorsRouter, 'connectors router missing');
  assert.ok(eventsRouter, 'events router missing');
  assert.ok(createWebhookRouter, 'webhook router missing');
});
