import { BaseConnector } from '../baseConnector.js';

export class SqlServerConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'sqlserver' });
  }
}
