import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  async find(payload = {}) {
    return this.execute('findUser', payload);
  }

  async findByUsername(username) {
    return this.execute('findUserByUsername', { username });
  }

  async findByRole(role) {
    return this.execute('findUserByRole', { role });
  }

  async create(payload) {
    return this.execute('createUser', payload);
  }

  async update(payload) {
    return this.execute('updateUser', payload);
  }

  async delete(payload = {}) {
    return this.execute('deleteUser', payload);
  }
}
