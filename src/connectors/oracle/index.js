import { BaseConnector } from '../baseConnector.js';

export class OracleConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'oracle' });
  }
}
