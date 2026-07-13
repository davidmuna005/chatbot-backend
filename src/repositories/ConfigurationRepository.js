import { BaseRepository } from './BaseRepository.js';

export class ConfigurationRepository extends BaseRepository {
  async get(payload = {}) {
    return this.execute('getConfiguration', payload);
  }

  async set(payload) {
    return this.execute('setConfiguration', payload);
  }

  async update(payload) {
    return this.execute('updateConfiguration', payload);
  }
}
