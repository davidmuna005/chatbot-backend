import { environment } from './environment.js';

export const services = {
  appName: environment.APP_NAME,
  appVersion: environment.APP_VERSION,
  buildTime: environment.BUILD_TIME || null
};
