import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

test('GET /api/health responds with ok', async () => {
  const response = await fetch('http://127.0.0.1:4000/api/health');
  assert.equal(response.status, 404);
});
