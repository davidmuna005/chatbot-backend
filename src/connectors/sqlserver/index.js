import { BaseConnector } from '../baseConnector.js';
import { SqlServerAdapter } from '../adapters/sqlserver.js';

export class SqlServerConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'sqlserver' });
    // Extract database config if nested, otherwise use config directly
    const adapterConfig = this.config.database || this.config;
    this.adapter = new SqlServerAdapter(adapterConfig, this.logger);
  }

  async initialize() {
    try {
      await this.adapter.initialize();
      this.initialized = true;
      this.state = 'connected';
      const adapterConfig = this.config.database || this.config;
      this.logger?.info?.('SQL Server Connector initialized', { server: adapterConfig.server, database: adapterConfig.database });
      return this;
    } catch (error) {
      this.logger?.error?.('SQL Server Connector initialization failed', { error: error.message });
      throw error;
    }
  }

  async connect() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      await this.adapter.connect();
      this.state = 'connected';
      this.connection = { connected: true, connector: this.type };
      return this.connection;
    } catch (error) {
      this.state = 'disconnected';
      this.logger?.error?.('SQL Server connection failed', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.adapter) {
        await this.adapter.disconnect();
      }
      this.state = 'disconnected';
      this.connection = null;
      this.logger?.info?.('SQL Server connection closed');
      return true;
    } catch (error) {
      this.logger?.error?.('Error closing SQL Server connection', { error: error.message });
      throw error;
    }
  }

  async reconnect() {
    await this.disconnect();
    return this.connect();
  }

  async health() {
    if (!this.initialized) {
      return 'Unknown';
    }

    try {
      const result = await this.adapter.health();
      this.logger?.info?.('SQL Server Health Check', { status: result.status });
      return result.status;
    } catch (error) {
      this.logger?.error?.('SQL Server health check failed', { error: error.message });
      return 'Error';
    }
  }
}
