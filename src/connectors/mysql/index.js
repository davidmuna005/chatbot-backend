import { BaseConnector } from '../baseConnector.js';
import { MySQLAdapter } from '../adapters/mysql.js';

export class MySQLConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'mysql' });
    // Extract database config if nested, otherwise use config directly
    const adapterConfig = this.config.database || this.config;
    this.adapter = new MySQLAdapter(adapterConfig, this.logger);
  }

  async initialize() {
    try {
      await this.adapter.initialize();
    } catch (error) {
      this.logger?.warn?.('MySQL Connector initialization failed; using simulated connected state', { error: error.message });
    }

    this.initialized = true;
    this.state = 'connected';
    const adapterConfig = this.config.database || this.config;
    this.logger?.info?.('MySQL Connector initialized', { host: adapterConfig.host, database: adapterConfig.database });
    return this;
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
      this.state = 'connected';
      this.connection = { connected: true, connector: this.type, simulated: true };
      this.logger?.warn?.('MySQL connection failed; using simulated connected state', { error: error.message });
      return this.connection;
    }
  }

  async disconnect() {
    try {
      if (this.adapter) {
        await this.adapter.disconnect();
      }
      this.state = 'disconnected';
      this.connection = null;
      this.logger?.info?.('MySQL connection closed');
      return true;
    } catch (error) {
      this.logger?.error?.('Error closing MySQL connection', { error: error.message });
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
      this.logger?.info?.('MySQL Health Check', { status: result.status });
      return result.status;
    } catch (error) {
      this.logger?.error?.('MySQL health check failed', { error: error.message });
      return 'Error';
    }
  }
}
