import { ServiceResult } from '../serviceResult.js';

export class TicketService {
  constructor({ ticketRepository, ticketPolicy, logger } = {}) {
    this.ticketRepository = ticketRepository;
    this.ticketPolicy = ticketPolicy;
    this.logger = logger;
  }

  async create(payload = {}) {
    try {
      this.logger?.info?.('Service started', { service: 'TicketService', action: 'create' });
      const decision = this.ticketPolicy?.evaluate?.({ ticket: payload, action: 'create' });
      if (!decision?.allowed) {
        return ServiceResult.accessDenied(decision?.reason ?? 'ticket-create-denied', {}, decision);
      }

      const ticket = await this.ticketRepository?.create?.(payload);
      this.logger?.info?.('Service completed', { service: 'TicketService', action: 'create' });
      return ServiceResult.success(ticket, {}, decision, 'Ticket created successfully', 'TICKET_CREATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'TicketService', action: 'create', error: error.message });
      return ServiceResult.failure(error.message);
    }
  }

  async close({ id }) {
    try {
      const ticket = await this.ticketRepository?.find?.({ id });
      const decision = this.ticketPolicy?.evaluate?.({ ticket, action: 'close' });
      if (!decision?.allowed) {
        return ServiceResult.accessDenied(decision?.reason ?? 'ticket-close-denied', {}, decision);
      }

      await this.ticketRepository?.close?.({ id });
      return ServiceResult.success({ id, closed: true }, {}, decision, 'Ticket closed successfully', 'TICKET_CLOSED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }
}
