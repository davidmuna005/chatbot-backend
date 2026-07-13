import { BaseRepository } from './BaseRepository.js';

export class TicketRepository extends BaseRepository {
  async create(payload) {
    return this.execute('createTicket', payload);
  }

  async find(payload = {}) {
    return this.execute('findTicket', payload);
  }

  async update(payload) {
    return this.execute('updateTicket', payload);
  }

  async assign(payload = {}) {
    return this.execute('assignTicket', payload);
  }

  async close(payload = {}) {
    return this.execute('closeTicket', payload);
  }
}
