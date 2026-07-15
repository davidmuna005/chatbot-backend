/**
 * Database Adapter Interface
 * 
 * Defines the contract that all database adapters must implement.
 * Adapters handle connection management and query execution for specific databases.
 */

import {
  ConnectorConnectionError,
  ConnectorConfigurationError,
  ConnectorTimeoutError,
  ConnectorUnavailableError
} from '../errors.js';

export class DatabaseAdapter {
  constructor(config = {}, logger) {
    this.config = config;
    this.logger = logger;
    this.pool = null;
    this.connection = null;
    this.state = 'disconnected';
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.queryTimeout = config.queryTimeout || 30000;
  }

  /**
   * Initialize connection pool
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Establish connection
   */
  async connect() {
    throw new Error('connect() must be implemented by subclass');
  }

  /**
   * Close connection
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by subclass');
  }

  /**
   * Execute a query
   */
  async query(sql, params = []) {
    throw new Error('query() must be implemented by subclass');
  }

  /**
   * Execute query with retry logic
   */
  async executeWithRetry(sql, params = []) {
    let lastError;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        return await this.query(sql, params);
      } catch (error) {
        lastError = error;
        this.logger?.warn?.(`Query attempt ${attempt + 1} failed`, {
          error: error.message,
          attempt: attempt + 1,
          maxAttempts: this.retryAttempts
        });

        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw new ConnectorUnavailableError(`Query failed after ${this.retryAttempts} attempts`, {
      sql: this.sanitizeSql(sql),
      cause: lastError?.message
    });
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries) {
    throw new Error('transaction() must be implemented by subclass');
  }

  /**
   * Get a single row
   */
  async getRow(sql, params = []) {
    const results = await this.query(sql, params);
    return results && results.length > 0 ? results[0] : null;
  }

  /**
   * Get multiple rows
   */
  async getRows(sql, params = []) {
    const results = await this.query(sql, params);
    return results || [];
  }

  /**
   * Get single value
   */
  async getValue(sql, params = []) {
    const row = await this.getRow(sql, params);
    if (!row) return null;

    const firstKey = Object.keys(row)[0];
    return row[firstKey];
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.connect();
      const result = await this.query('SELECT 1 as test');
      await this.disconnect();
      return { connected: true, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger?.error?.('Connection test failed', { error: error.message });
      throw new ConnectorConnectionError('Database connection test failed', {
        cause: error.message
      });
    }
  }

  /**
   * Get connection health status
   */
  async health() {
    try {
      if (this.state === 'connected' && this.pool) {
        const result = await this.query('SELECT 1 as test');
        return { status: 'connected', timestamp: new Date().toISOString() };
      }
      return { status: 'disconnected', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'error', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Sanitize SQL for logging (remove sensitive data)
   */
  sanitizeSql(sql) {
    if (!sql) return '';
    return sql.replace(/password\s*=\s*['"][^'"]*['"]/gi, "password='***'");
  }

  /**
   * Validate configuration
   */
  validateConfiguration() {
    if (!this.config.host && !this.config.connectionString && !this.config.server) {
      throw new ConnectorConfigurationError('Database host or connection string is required');
    }

    if (!this.config.database && !this.config.databaseName) {
      throw new ConnectorConfigurationError('Database name is required');
    }

    return true;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.pool) {
        await this.pool.end?.();
        this.pool = null;
      }
      this.state = 'disconnected';
      this.logger?.info?.('Resources cleaned up');
    } catch (error) {
      this.logger?.error?.('Cleanup error', { error: error.message });
    }
  }

  /**
   * Get adapter type
   */
  getType() {
    throw new Error('getType() must be implemented by subclass');
  }

  /**
   * Get adapter version
   */
  getVersion() {
    return '1.0.0';
  }
}
