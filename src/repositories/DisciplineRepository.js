import { BaseRepository } from './BaseRepository.js';

export class DisciplineRepository extends BaseRepository {
  async getDiscipline(payload = {}) {
    return this.execute('getDiscipline', payload);
  }

  async getIncidents(payload = {}) {
    return this.execute('getIncidents', payload);
  }
}
