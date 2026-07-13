import { BaseRepository } from './BaseRepository.js';
import { RepositoryError } from './errors.js';

export class SessionRepository extends BaseRepository {
  async create(payload) {
    try {
      return await this.execute('createSession', payload);
    } catch (error) {
      throw new RepositoryError('Unable to create session record', { repository: this.constructor.name, cause: error.message });
    }
  }

  async find(payload = {}) {
    return this.execute('findSession', payload);
  }

  async invalidate(payload = {}) {
    return this.execute('invalidateSession', payload);
  }

  async update(payload) {
    return this.execute('updateSession', payload);
  }

  async delete(payload = {}) {
    return this.execute('deleteSession', payload);
  }
}
