import {
  ConnectorConfigurationError,
  ConnectorConnectionError,
  ConnectorTimeoutError,
  ConnectorUnsupportedFeatureError,
  ConnectorUnavailableError
} from './errors.js';

export class BaseConnector {
  constructor(options = {}) {
    const { config: providedConfig, logger: providedLogger, type: providedType } = options;
    const resolvedConfig = providedConfig ?? options;
    const resolvedLogger = providedLogger ?? resolvedConfig.logger;

    this.type = providedType ?? resolvedConfig.type ?? resolvedConfig.engine;
    this.config = resolvedConfig;
    this.logger = resolvedLogger;
    this.state = 'disconnected';
    this.initialized = false;
    this.connection = null;
  }

  async initialize() {
    this.initialized = true;
    this.logger?.info?.('Connector Initialized', { connector: this.type });
    return this;
  }

  async connect() {
    if (!this.initialized) {
      await this.initialize();
    }

    this.validateConfiguration();
    this.state = 'connecting';
    this.logger?.info?.('Connection Established', { connector: this.type });
    this.state = 'connected';
    this.connection = { connected: true, connector: this.type };
    return this.connection;
  }

  async disconnect() {
    this.state = 'disconnected';
    this.connection = null;
    this.logger?.info?.('Connection Closed', { connector: this.type });
    return true;
  }

  async reconnect() {
    await this.disconnect();
    return this.connect();
  }

  async cleanup() {
    return this.disconnect();
  }

  async health() {
    if (!this.initialized) {
      return 'Unknown';
    }

    if (this.state === 'connected') {
      this.logger?.info?.('Health Check', { connector: this.type, status: 'Connected' });
      return 'Connected';
    }

    this.logger?.info?.('Health Check', { connector: this.type, status: this.state });
    return this.state === 'connecting' ? 'Unknown' : 'Disconnected';
  }

  validateConfiguration() {
    const databaseConfig = this.config?.database ?? this.config ?? {};
    const engine = databaseConfig.engine ?? databaseConfig.type ?? this.type;

    if (!engine) {
      throw new ConnectorConfigurationError('Database engine is required', { connector: this.type });
    }

    const host = databaseConfig.host ?? databaseConfig.hostname ?? databaseConfig.server;
    if (!host && !databaseConfig.url) {
      throw new ConnectorConfigurationError('Database host or URL is required', { connector: this.type });
    }

    const databaseName = databaseConfig.database ?? databaseConfig.name;
    if (!databaseName) {
      throw new ConnectorConfigurationError('Database name is required', { connector: this.type });
    }

    return true;
  }

  async getStudent() {
    throw new ConnectorUnsupportedFeatureError('getStudent() is not implemented by this connector', { connector: this.type });
  }

  async getParent() {
    throw new ConnectorUnsupportedFeatureError('getParent() is not implemented by this connector', { connector: this.type });
  }

  async getAttendance() {
    throw new ConnectorUnsupportedFeatureError('getAttendance() is not implemented by this connector', { connector: this.type });
  }

  async getResults() {
    throw new ConnectorUnsupportedFeatureError('getResults() is not implemented by this connector', { connector: this.type });
  }

  async getFeeBalance() {
    throw new ConnectorUnsupportedFeatureError('getFeeBalance() is not implemented by this connector', { connector: this.type });
  }

  async getFeeStatement() {
    throw new ConnectorUnsupportedFeatureError('getFeeStatement() is not implemented by this connector', { connector: this.type });
  }

  async getDiscipline() {
    throw new ConnectorUnsupportedFeatureError('getDiscipline() is not implemented by this connector', { connector: this.type });
  }

  async getCalendar() {
    throw new ConnectorUnsupportedFeatureError('getCalendar() is not implemented by this connector', { connector: this.type });
  }

  async getStudentStatus() {
    throw new ConnectorUnsupportedFeatureError('getStudentStatus() is not implemented by this connector', { connector: this.type });
  }

  async getParentStudents() {
    throw new ConnectorUnsupportedFeatureError('getParentStudents() is not implemented by this connector', { connector: this.type });
  }

  async getStudentProfile() {
    throw new ConnectorUnsupportedFeatureError('getStudentProfile() is not implemented by this connector', { connector: this.type });
  }

  async execute() {
    throw new ConnectorUnsupportedFeatureError('execute() is not implemented by this connector', { connector: this.type });
  }

  async testConnection() {
    try {
      await this.connect();
      return { connected: true, connector: this.type };
    } catch (error) {
      this.logger?.error?.('Connection Failed', { connector: this.type, error: error.message });
      throw new ConnectorConnectionError('Connection test failed', { connector: this.type, cause: error.message });
    }
  }

  getVersion() {
    return '1.0.0';
  }
}
