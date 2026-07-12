import { connectorRegistry, registerBuiltInConnectors } from './registry.js';

export const initializeConnectorRegistry = () => {
  registerBuiltInConnectors();
  return connectorRegistry;
};

export { connectorRegistry };
