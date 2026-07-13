# Backend Routes Structure

## Routes Overview

```text
backend/src/routes/
├── analytics.js
├── api/
│   └── index.js
├── auth.js
├── connectors.js
├── dashboard/
├── events.js
├── health.js
├── index.js
├── root.js
├── version.js
└── webhook/
```

## Route Files

- analytics.js: analytics summary endpoint
- api/index.js: mounts versioned API routers
- auth.js: authentication-related routes
- connectors.js: connector management routes
- dashboard/: dashboard-specific routes
- events.js: event-related routes
- health.js: health check endpoint
- index.js: main router aggregator
- root.js: root endpoint
- version.js: version endpoint
- webhook/: webhook handlers
