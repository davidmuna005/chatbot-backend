import { BaseConnector } from '../baseConnector.js';

export class MySQLConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'mysql' });
  }
}
