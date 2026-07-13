import createRootRouter from '../src/routes/root.js';
import createHealthRouter from '../src/routes/health.js';
import createVersionRouter from '../src/routes/version.js';
import analyticsRouter from '../src/routes/analytics.js';
import authRouter from '../src/routes/auth.js';
import connectorsRouter from '../src/routes/connectors.js';
import eventsRouter from '../src/routes/events.js';
import createWebhookRouter from '../src/routes/webhook/index.js';

console.log('root', typeof createRootRouter, createRootRouter ? 'ok' : 'missing');
console.log('health', typeof createHealthRouter, createHealthRouter ? 'ok' : 'missing');
console.log('version', typeof createVersionRouter, createVersionRouter ? 'ok' : 'missing');
console.log('analytics', typeof analyticsRouter, analyticsRouter && typeof analyticsRouter.handle === 'function' ? 'router' : 'not-router');
console.log('auth', typeof authRouter, authRouter && typeof authRouter.handle === 'function' ? 'router' : 'not-router');
console.log('connectors', typeof connectorsRouter, connectorsRouter && typeof connectorsRouter.handle === 'function' ? 'router' : 'not-router');
console.log('events', typeof eventsRouter, eventsRouter && typeof eventsRouter.handle === 'function' ? 'router' : 'not-router');
console.log('webhook', typeof createWebhookRouter, createWebhookRouter && typeof createWebhookRouter.handle === 'function' ? 'router' : 'not-router');
