import { createSchoolRegistry } from './schoolRegistry.js';
import { createConnectorRegistry } from './connectorRegistry.js';
import { createApiGateway } from './apiGateway.js';
import { createSchoolRouter } from './schoolRouter.js';
import { createHeartbeatService } from './heartbeatService.js';

export const createPlatformArchitecture = (dependencies = {}) => {
  const schoolRegistry = createSchoolRegistry(dependencies);
  const connectorRegistry = createConnectorRegistry(dependencies);
  const apiGateway = createApiGateway(dependencies);
  const schoolRouter = createSchoolRouter({ ...dependencies, schoolRegistry, connectorRegistry, apiGateway });
  const heartbeatService = createHeartbeatService({ ...dependencies, schoolRegistry, connectorRegistry });

  return {
    schoolRegistry,
    connectorRegistry,
    apiGateway,
    schoolRouter,
    heartbeatService
  };
};

export default createPlatformArchitecture;
