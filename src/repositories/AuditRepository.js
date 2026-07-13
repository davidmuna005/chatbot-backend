import { BaseRepository } from './BaseRepository.js';

export class AuditRepository extends BaseRepository {
  async create(payload) {
    return this.execute('createAuditEntry', payload);
  }

  async find(payload = {}) {
    return this.execute('findAuditEntry', payload);
  }

  async search(payload = {}) {
    return this.execute('searchAuditEntries', payload);
  }
}
