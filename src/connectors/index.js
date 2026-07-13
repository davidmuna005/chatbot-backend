import { connectorRegistry, registerBuiltInConnectors } from './registry.js';
import { ConnectorFactory } from './factory.js';

export const initializeConnectorRegistry = () => {
  registerBuiltInConnectors();
  return connectorRegistry;
};

export { connectorRegistry, ConnectorFactory };
export { BaseConnector } from './baseConnector.js';
export { ConnectorConfigurationError, ConnectorConnectionError, ConnectorTimeoutError, ConnectorUnsupportedFeatureError, ConnectorUnavailableError } from './errors.js';
