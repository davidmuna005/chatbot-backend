/**
 * MySQL Database Adapter
 * 
 * Implements database operations for MySQL using mysql2/promise
 * Supports connection pooling, retries, and transaction handling
 */

import mysql from 'mysql2/promise.js';
import { DatabaseAdapter } from './base.js';
import { ConnectorConnectionError, ConnectorTimeoutError } from '../errors.js';

export class MySQLAdapter extends DatabaseAdapter {
  constructor(config = {}, logger) {
    super(config, logger);
    this.type = 'mysql';
  }

  /**
   * Initialize connection pool
   */
  async initialize() {
    try {
      this.validateConfiguration();

      this.pool = await mysql.createPool({
        host: this.config.host || this.config.hostname,
        port: this.config.port || 3306,
        user: this.config.username || this.config.user,
        password: this.config.password,
        database: this.config.database || this.config.databaseName,
        waitForConnections: true,
        connectionLimit: this.config.connectionLimit || 10,
        queueLimit: this.config.queueLimit || 0,
        enableKeepAlive: true,
        keepAliveInitialDelayMs: 0,
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: true,
        decimalNumbers: true,
        timeout: this.queryTimeout,
        multipleStatements: false
      });

      this.state = 'connected';
      this.logger?.info?.('MySQL adapter initialized', {
        host: this.config.host,
        database: this.config.database,
        connectionLimit: this.config.connectionLimit || 10
      });

      return this;
    } catch (error) {
      this.logger?.error?.('MySQL adapter initialization failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to initialize MySQL connection pool', {
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

      // Get a connection from the pool to verify connectivity
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      this.state = 'connected';
      this.logger?.info?.('MySQL connection established');

      return true;
    } catch (error) {
      this.state = 'disconnected';
      this.logger?.error?.('MySQL connection failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to connect to MySQL database', {
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
      this.logger?.info?.('MySQL connection closed');
      return true;
    } catch (error) {
      this.logger?.error?.('Error closing MySQL connection', { error: error.message });
      throw new ConnectorConnectionError('Failed to disconnect from MySQL', {
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

    const connection = await this.pool.getConnection();

    try {
      const [rows] = await Promise.race([
        connection.query(sql, params),
        new Promise((_, reject) =>
          setTimeout(() => reject(new ConnectorTimeoutError('Query timeout')), this.queryTimeout)
        )
      ]);

      return rows || [];
    } catch (error) {
      this.logger?.error?.('MySQL query failed', {
        error: error.message,
        sql: this.sanitizeSql(sql)
      });

      if (error instanceof ConnectorTimeoutError) {
        throw error;
      }

      throw new ConnectorConnectionError('MySQL query execution failed', {
        cause: error.message
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Execute transaction
   */
  async transaction(queryFunctions) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const results = [];
      for (const queryFunc of queryFunctions) {
        const result = await queryFunc(connection);
        results.push(result);
      }

      await connection.commit();
      this.logger?.info?.('Transaction committed successfully');

      return results;
    } catch (error) {
      await connection.rollback();
      this.logger?.error?.('Transaction failed, rolled back', { error: error.message });

      throw new ConnectorConnectionError('Transaction failed', {
        cause: error.message
      });
    } finally {
      connection.release();
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
   * Validate configuration specific to MySQL
   */
  validateConfiguration() {
    super.validateConfiguration();

    // MySQL-specific validation
    if (!this.config.username && !this.config.user) {
      throw new Error('MySQL username is required');
    }

    return true;
  }
}
