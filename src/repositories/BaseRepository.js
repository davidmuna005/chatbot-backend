import { RepositoryError, RepositoryUnavailableError } from './errors.js';

export class BaseRepository {
  constructor({ connector, logger, registry } = {}) {
    this.connector = connector;
    this.logger = logger;
    this.registry = registry;
    this.initialized = true;
    this.logger?.info?.('Repository initialized', { repository: this.constructor.name });
  }

  resolveConnector() {
    if (this.connector) {
      return this.connector;
    }

    if (!this.registry) {
      throw new RepositoryUnavailableError('No connector or registry available for repository', {
        repository: this.constructor.name
      });
    }

    return this.registry.getActiveConnector?.() ?? this.registry.getConnector?.('default', {});
  }

  async execute(operation, payload = {}) {
    const connector = this.resolveConnector();

    try {
      this.logger?.info?.('Repository operation started', { repository: this.constructor.name, operation });
      const result = await connector.execute?.({ operation, payload });
      this.logger?.info?.('Repository operation completed', { repository: this.constructor.name, operation });
      return result;
    } catch (error) {
      this.logger?.error?.('Repository operation failed', {
        repository: this.constructor.name,
        operation,
        error: error.message
      });

      throw new RepositoryError(`Repository operation failed: ${operation}`, {
        repository: this.constructor.name,
        operation,
        cause: error.message
      });
    }
  }

  async callConnector(method, payload = {}) {
    const connector = this.resolveConnector();

    try {
      this.logger?.info?.('Repository operation started', { repository: this.constructor.name, operation: method });
      const result = await connector[method]?.(payload);
      this.logger?.info?.('Repository operation completed', { repository: this.constructor.name, operation: method });
      return result;
    } catch (error) {
      this.logger?.error?.('Repository operation failed', {
        repository: this.constructor.name,
        operation: method,
        error: error.message
      });

      throw new RepositoryError(`Repository operation failed: ${method}`, {
        repository: this.constructor.name,
        operation: method,
        cause: error.message
      });
    }
  }
}
