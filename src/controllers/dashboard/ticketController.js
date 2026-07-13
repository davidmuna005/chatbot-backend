import { TicketService } from '../../services/index.js';
import { ServiceResult } from '../../services/serviceResult.js';

export class TicketController {
  constructor(dependencies = {}) {
    this.ticketService = dependencies.ticketService || new TicketService(dependencies);
  }

  async list(req, res, next) {
    try {
      const result = await (typeof this.ticketService.list === 'function'
        ? this.ticketService.list(req.query)
        : ServiceResult.failure('Ticket listing not implemented', {}, null, 'Ticket listing not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await (typeof this.ticketService.getById === 'function'
        ? this.ticketService.getById(req.params.id)
        : ServiceResult.notFound('Ticket not found', {}));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await (typeof this.ticketService.create === 'function'
        ? this.ticketService.create(req.body)
        : ServiceResult.failure('Ticket creation not implemented', {}, null, 'Ticket creation not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 201 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await (typeof this.ticketService.update === 'function'
        ? this.ticketService.update(req.params.id, req.body)
        : ServiceResult.failure('Ticket update not implemented', {}, null, 'Ticket update not implemented', 'NOT_IMPLEMENTED'));
      return res.status(result?.success ? 200 : 400).json(result);
    } catch (error) {
      return next(error);
    }
  }
}
