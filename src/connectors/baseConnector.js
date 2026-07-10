export class BaseConnector {
  constructor(config) {
    this.config = config;
  }

  async connect() {
    throw new Error('connect() must be implemented');
  }

  async executeQuery(query) {
    throw new Error('executeQuery() must be implemented');
  }

  async healthCheck() {
    return { status: 'ok' };
  }

  getVersion() {
    return '1.0.0';
  }
}
