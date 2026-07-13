import { BaseRepository } from './BaseRepository.js';

export class ResultsRepository extends BaseRepository {
  async getResults(payload = {}) {
    return this.execute('getResults', payload);
  }

  async getExamResults(payload = {}) {
    return this.execute('getExamResults', payload);
  }

  async getLatestResults(payload = {}) {
    return this.execute('getLatestResults', payload);
  }
}
