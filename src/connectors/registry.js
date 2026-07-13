import { ConnectorConfigurationError } from './errors.js';
import { MySQLConnector } from './mysql/index.js';
import { SqlServerConnector } from './sqlserver/index.js';
import { PostgresConnector } from './postgres/index.js';
import { OracleConnector } from './oracle/index.js';
import { RestConnector } from './rest/index.js';

export class ConnectorRegistry {
  constructor() {
    this.connectors = new Map();
    this.activeConnector = null;
  }

  register(type, connectorClass) {
    if (!type || typeof connectorClass !== 'function') {
      throw new ConnectorConfigurationError('Connector registration requires a valid type and constructor', { type });
    }

    this.connectors.set(type, connectorClass);
    return this;
  }

  getConnectorClass(type) {
    return this.connectors.get(type);
  }

  getConnector(type, options = {}) {
    const ConnectorClass = this.getConnectorClass(type);
    if (!ConnectorClass) {
      throw new ConnectorConfigurationError(`Connector '${type}' is not registered`, { type });
    }

    const connector = new ConnectorClass(options);
    this.activeConnector = connector;
    return connector;
  }

  list() {
    return Array.from(this.connectors.keys());
  }

  getActiveConnector() {
    return this.activeConnector;
  }
}

export const connectorRegistry = new ConnectorRegistry();

export const registerBuiltInConnectors = () => {
  connectorRegistry
    .register('mysql', MySQLConnector)
    .register('sqlserver', SqlServerConnector)
    .register('postgres', PostgresConnector)
    .register('oracle', OracleConnector)
    .register('rest', RestConnector);

  return connectorRegistry;
};
