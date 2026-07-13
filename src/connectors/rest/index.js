import { BaseConnector } from '../baseConnector.js';

export class RestConnector extends BaseConnector {
  constructor(options = {}) {
    super({ ...options, type: 'rest' });
  }
}
