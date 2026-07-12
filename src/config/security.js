import { environment } from './environment.js';

export const security = {
  corsOrigin: environment.CORS_ORIGIN,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  },
  contentSecurityPolicy: false
};
