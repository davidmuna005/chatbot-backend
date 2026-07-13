import { BaseConnector } from '../baseConnector.js';

export class PostgresConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'postgres' });
  }
}
