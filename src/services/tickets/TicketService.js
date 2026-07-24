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

      const message = payload?.message || payload?.subject;
      if (!message) {
        return ServiceResult.validationFailed('Message or subject is required to create a ticket');
      }

      const ticketPolicyPayload = {
        ...payload,
        message
      };
      const decision = this.ticketPolicy?.evaluate?.({ ticket: ticketPolicyPayload, action: 'create' });
      if (!decision?.allowed) {
        return ServiceResult.failure(decision?.reason ?? 'ticket-create-denied', {}, decision, 'Ticket creation denied', 'TICKET_CREATE_DENIED');
      }

      const ticketRecord = {
        ...payload,
        message,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ status: 'open', note: 'Ticket created', timestamp: new Date().toISOString() }]
      };

      const ticket = await this.ticketRepository?.create?.(ticketRecord);
      this.logger?.info?.('Service completed', { service: 'TicketService', action: 'create', ticketId: ticket?.id });
      return ServiceResult.success(ticket, {}, decision, 'Ticket created successfully', 'TICKET_CREATED');
    } catch (error) {
      this.logger?.error?.('Service failed', { service: 'TicketService', action: 'create', error: error.message });
      return ServiceResult.fromError(error);
    }
  }

  async list({ parentId, status } = {}) {
    try {
      const tickets = await this.ticketRepository?.find?.({ parentId, status });
      const items = Array.isArray(tickets) ? tickets : tickets ? [tickets] : [];
      return ServiceResult.success(items, {}, null, 'Tickets retrieved successfully', 'TICKETS_LISTED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async getById(id) {
    try {
      const ticket = await this.ticketRepository?.find?.({ id });
      if (!ticket) {
        return ServiceResult.notFound('Ticket not found', {}, null, 'Ticket not found', 'TICKET_NOT_FOUND');
      }
      return ServiceResult.success(ticket, {}, null, 'Ticket retrieved successfully', 'TICKET_FOUND');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async update(id, payload = {}) {
    try {
      const ticket = await this.ticketRepository?.find?.({ id });
      if (!ticket) {
        return ServiceResult.notFound('Ticket not found', {}, null, 'Ticket not found', 'TICKET_NOT_FOUND');
      }

      const decision = this.ticketPolicy?.evaluate?.({ ticket, action: 'edit' });
      if (!decision?.allowed) {
        return ServiceResult.failure(decision?.reason ?? 'ticket-edit-denied', {}, decision, 'Ticket edit denied', 'TICKET_EDIT_DENIED');
      }

      const updatedTicket = await this.ticketRepository?.update?.({ id, ...payload, updatedAt: new Date().toISOString() });
      return ServiceResult.success(updatedTicket, {}, decision, 'Ticket updated successfully', 'TICKET_UPDATED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async close({ id }) {
    try {
      const ticket = await this.ticketRepository?.find?.({ id });
      if (!ticket) {
        return ServiceResult.notFound('Ticket not found', {}, null, 'Ticket not found', 'TICKET_NOT_FOUND');
      }

      const decision = this.ticketPolicy?.evaluate?.({ ticket, action: 'close' });
      if (!decision?.allowed) {
        return ServiceResult.failure(decision?.reason ?? 'ticket-close-denied', {}, decision, 'Ticket close denied', 'TICKET_CLOSE_DENIED');
      }

      await this.ticketRepository?.close?.({ id });
      return ServiceResult.success({ id, closed: true }, {}, decision, 'Ticket closed successfully', 'TICKET_CLOSED');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }

  async getHistory({ id }) {
    try {
      const ticket = await this.ticketRepository?.find?.({ id, includeHistory: true });
      if (!ticket) {
        return ServiceResult.notFound('Ticket not found', {}, null, 'Ticket not found', 'TICKET_NOT_FOUND');
      }

      return ServiceResult.success(ticket.history || [], {}, null, 'Ticket history retrieved successfully', 'TICKET_HISTORY_FOUND');
    } catch (error) {
      return ServiceResult.fromError(error);
    }
  }
}
