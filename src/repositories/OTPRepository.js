import { BaseRepository } from './BaseRepository.js';

export class OTPRepository extends BaseRepository {
  async create(payload) {
    return this.execute('createOtp', payload);
  }

  async find(payload = {}) {
    return this.execute('findOtp', payload);
  }

  async findLatest(payload = {}) {
    return this.execute('findLatestOtp', payload);
  }

  async update(payload) {
    return this.execute('updateOtp', payload);
  }

  async delete(payload = {}) {
    return this.execute('deleteOtp', payload);
  }

  async expire(payload = {}) {
    return this.execute('expireOtp', payload);
  }
}
