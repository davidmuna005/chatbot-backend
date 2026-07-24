import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RepositoryError, RepositoryUnavailableError } from './errors.js';

const fixturePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..', 'test-databases', 'green-valley-seed.json');
let fixtureSeedCache = null;

function loadFixtureSeed() {
  if (fixtureSeedCache) {
    return fixtureSeedCache;
  }

  if (!existsSync(fixturePath)) {
    return null;
  }

  try {
    fixtureSeedCache = JSON.parse(readFileSync(fixturePath, 'utf8'));
  } catch (error) {
    fixtureSeedCache = null;
  }

  return fixtureSeedCache;
}

export class BaseRepository {
  constructor({ connector, logger, registry } = {}) {
    this.connector = connector;
    this.logger = logger;
    this.registry = registry;
    this.initialized = true;
    this.fixtureSeed = loadFixtureSeed();
    this.logger?.info?.('Repository initialized', { repository: this.constructor.name });
  }

  getFixtureSeed() {
    if (!this.fixtureSeed) {
      this.fixtureSeed = loadFixtureSeed();
    }

    return this.fixtureSeed;
  }

  getFixturePath() {
    return fixturePath;
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
