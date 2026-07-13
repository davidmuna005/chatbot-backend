import { BaseRepository } from './BaseRepository.js';

export class NotificationRepository extends BaseRepository {
  async create(payload) {
    return this.execute('createNotification', payload);
  }

  async find(payload = {}) {
    return this.execute('findNotification', payload);
  }

  async search(payload = {}) {
    const result = await this.callConnector('execute', { filter: payload });
    return Array.isArray(result) ? result.map((item) => ({
      id: item.id,
      recipient: item.recipient ?? item.userId,
      channel: item.channel
    })) : [];
  }
}
