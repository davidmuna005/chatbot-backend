import { BaseRepository } from './BaseRepository.js';

export class FeeRepository extends BaseRepository {
  async getFeeBalance(payload = {}) {
    return this.execute('getFeeBalance', payload);
  }

  async getFeeStatement(payload = {}) {
    return this.execute('getFeeStatement', payload);
  }

  async getTransactions(payload = {}) {
    return this.execute('getTransactions', payload);
  }
}
