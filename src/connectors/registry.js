import { BaseConnector } from './baseConnector.js';

export class ConnectorRegistry {
  constructor() {
    this.connectors = new Map();
  }

  register(type, connectorClass) {
    this.connectors.set(type, connectorClass);
  }

  create(type, config) {
    const ConnectorClass = this.connectors.get(type);
    if (!ConnectorClass) {
      throw new Error(`Connector ${type} is not registered`);
    }

    return new ConnectorClass(config);
  }

  list() {
    return Array.from(this.connectors.keys());
  }
}

export const connectorRegistry = new ConnectorRegistry();
export const registerBuiltInConnectors = () => {
  connectorRegistry.register('mysql', BaseConnector);
  connectorRegistry.register('postgres', BaseConnector);
  connectorRegistry.register('sqlserver', BaseConnector);
  connectorRegistry.register('oracle', BaseConnector);
  connectorRegistry.register('sqlite', BaseConnector);
};
