/**
 * PostgreSQL Database Adapter
 * 
 * Implements database operations for PostgreSQL using pg
 * Supports connection pooling, retries, and transaction handling
 */

import pg from 'pg';
import { DatabaseAdapter } from './base.js';
import { ConnectorConnectionError, ConnectorTimeoutError } from '../errors.js';

const { Pool } = pg;

export class PostgresAdapter extends DatabaseAdapter {
  constructor(config = {}, logger) {
    super(config, logger);
    this.type = 'postgres';
  }

  /**
   * Initialize connection pool
   */
  async initialize() {
    try {
      this.validateConfiguration();

      this.pool = new Pool({
        host: this.config.host || this.config.hostname,
        port: this.config.port || 5432,
        user: this.config.username || this.config.user,
        password: this.config.password,
        database: this.config.database || this.config.databaseName,
        max: this.config.connectionLimit || 10,
        idleTimeoutMillis: this.config.idleTimeout || 30000,
        connectionTimeoutMillis: this.config.connectionTimeout || 2000,
        application_name: 'school-connector',
        statement_timeout: this.queryTimeout
      });

      // Set up event listeners
      this.pool.on('error', (err) => {
        this.logger?.error?.('PostgreSQL pool error', { error: err.message });
      });

      this.pool.on('connect', () => {
        this.logger?.debug?.('PostgreSQL pool connection created');
      });

      this.pool.on('remove', () => {
        this.logger?.debug?.('PostgreSQL pool connection removed');
      });

      this.state = 'connected';
      this.logger?.info?.('PostgreSQL adapter initialized', {
        host: this.config.host,
        database: this.config.database,
        connectionLimit: this.config.connectionLimit || 10
      });

      return this;
    } catch (error) {
      this.logger?.error?.('PostgreSQL adapter initialization failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to initialize PostgreSQL connection pool', {
        host: this.config.host,
        cause: error.message
      });
    }
  }

  /**
   * Establish connection
   */
  async connect() {
    try {
      if (!this.pool) {
        await this.initialize();
      }

      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.state = 'connected';
      this.logger?.info?.('PostgreSQL connection established');

      return true;
    } catch (error) {
      this.state = 'disconnected';
      this.logger?.error?.('PostgreSQL connection failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to connect to PostgreSQL database', {
        cause: error.message
      });
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
      this.state = 'disconnected';
      this.logger?.info?.('PostgreSQL connection closed');
      return true;
    } catch (error) {
      this.logger?.error?.('Error closing PostgreSQL connection', { error: error.message });
      throw new ConnectorConnectionError('Failed to disconnect from PostgreSQL', {
        cause: error.message
      });
    }
  }

  /**
   * Execute query
   */
  async query(sql, params = []) {
    if (!this.pool || this.state !== 'connected') {
      await this.connect();
    }

    const client = await this.pool.connect();

    try {
      const result = await Promise.race([
        client.query(sql, params),
        new Promise((_, reject) =>
          setTimeout(() => reject(new ConnectorTimeoutError('Query timeout')), this.queryTimeout)
        )
      ]);

      return result.rows || [];
    } catch (error) {
      this.logger?.error?.('PostgreSQL query failed', {
        error: error.message,
        sql: this.sanitizeSql(sql)
      });

      if (error instanceof ConnectorTimeoutError) {
        throw error;
      }

      throw new ConnectorConnectionError('PostgreSQL query execution failed', {
        cause: error.message
      });
    } finally {
      client.release();
    }
  }

  /**
   * Execute transaction
   */
  async transaction(queryFunctions) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const results = [];
      for (const queryFunc of queryFunctions) {
        const result = await queryFunc(client);
        results.push(result);
      }

      await client.query('COMMIT');
      this.logger?.info?.('PostgreSQL transaction committed successfully');

      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger?.error?.('PostgreSQL transaction failed, rolled back', { error: error.message });

      throw new ConnectorConnectionError('PostgreSQL transaction failed', {
        cause: error.message
      });
    } finally {
      client.release();
    }
  }

  /**
   * Build SELECT query for a table
   */
  buildSelectQuery(table, columns = '*', whereClause = '') {
    const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
    const sql = `SELECT ${columnList} FROM ${table}`;

    if (whereClause) {
      return `${sql} WHERE ${whereClause}`;
    }

    return sql;
  }

  /**
   * Get adapter type
   */
  getType() {
    return this.type;
  }

  /**
   * Validate configuration specific to PostgreSQL
   */
  validateConfiguration() {
    super.validateConfiguration();

    // PostgreSQL-specific validation
    if (!this.config.username && !this.config.user) {
      throw new Error('PostgreSQL username is required');
    }

    return true;
  }
}
