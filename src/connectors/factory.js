import { ConnectorConfigurationError } from './errors.js';

export class ConnectorFactory {
  constructor(registry) {
    this.registry = registry;
  }

  create(type, config, logger) {
    if (!type) {
      throw new ConnectorConfigurationError('Connector type is required', { type });
    }

    const connectorClass = this.registry.getConnectorClass(type);
    if (!connectorClass) {
      throw new ConnectorConfigurationError(`Connector type '${type}' is not supported`, { type });
    }

    return new connectorClass({ config, logger, type });
  }

  createFromConfig(config, logger) {
    const databaseConfig = config?.database ?? config ?? {};
    const engine = databaseConfig.engine ?? databaseConfig.type;

    if (!engine) {
      throw new ConnectorConfigurationError('Database engine is required in configuration', { config });
    }

    return this.create(engine, config, logger);
  }
}
