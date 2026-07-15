import { BaseConnector } from '../baseConnector.js';
import { PostgresAdapter } from '../adapters/postgres.js';

export class PostgresConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'postgres' });
    // Extract database config if nested, otherwise use config directly
    const adapterConfig = this.config.database || this.config;
    this.adapter = new PostgresAdapter(adapterConfig, this.logger);
  }

  async initialize() {
    try {
      await this.adapter.initialize();
      this.initialized = true;
      this.state = 'connected';
      const adapterConfig = this.config.database || this.config;
      this.logger?.info?.('PostgreSQL Connector initialized', { host: adapterConfig.host, database: adapterConfig.database });
      return this;
    } catch (error) {
      this.logger?.error?.('PostgreSQL Connector initialization failed', { error: error.message });
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
      this.logger?.error?.('PostgreSQL connection failed', { error: error.message });
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
      this.logger?.info?.('PostgreSQL connection closed');
      return true;
    } catch (error) {
      this.logger?.error?.('Error closing PostgreSQL connection', { error: error.message });
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
      this.logger?.info?.('PostgreSQL Health Check', { status: result.status });
      return result.status;
    } catch (error) {
      this.logger?.error?.('PostgreSQL health check failed', { error: error.message });
      return 'Error';
    }
  }
}
