/**
 * Ticket Management Routes
 */

import { Router } from 'express';
import { verifyToken, requirePermission } from '../middleware/rbac.js';
import { TicketService } from '../services/ticketService.js';
import { AuditService } from '../services/auditService.js';

export function createTicketManagementRouter(dependencies = {}) {
  const router = Router();
  const { database, logger } = dependencies;
  
  const ticketService = new TicketService({ database, logger });
  const auditService = new AuditService({ database, logger });

  router.use(verifyToken);

  /**
   * GET /api/v1/admin/tickets - List tickets
   */
  router.get('/', requirePermission('tickets:view'), async (req, res) => {
    try {
      const { status, priority, assignedTo, limit = 50, offset = 0 } = req.query;
      
      const result = await ticketService.listTickets(
        { status, priority, assignedTo },
        parseInt(limit),
        parseInt(offset)
      );

      res.json(result);
    } catch (error) {
      logger?.error?.('List tickets error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/tickets/:id - Get ticket
   */
  router.get('/:id', requirePermission('tickets:view'), async (req, res) => {
    try {
      const result = await ticketService.getTicket(req.params.id);

      await auditService.logSensitiveOperation(req, 'TICKET_VIEW', 'tickets', {
        ticketId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Get ticket error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/tickets - Create ticket
   */
  router.post('/', requirePermission('tickets:create'), async (req, res) => {
    try {
      const result = await ticketService.createTicket(req.body);

      await auditService.logSensitiveOperation(req, 'TICKET_CREATED', 'tickets', {
        subject: req.body.subject,
        priority: req.body.priority,
      });

      res.status(201).json(result);
    } catch (error) {
      logger?.error?.('Create ticket error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * PATCH /api/v1/admin/tickets/:id - Update ticket
   */
  router.patch('/:id', requirePermission('tickets:manage'), async (req, res) => {
    try {
      const result = await ticketService.updateTicket(req.params.id, req.body);

      await auditService.logSensitiveOperation(req, 'TICKET_UPDATED', 'tickets', {
        ticketId: req.params.id,
        updates: Object.keys(req.body),
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Update ticket error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/tickets/:id/close - Close ticket
   */
  router.post('/:id/close', requirePermission('tickets:manage'), async (req, res) => {
    try {
      const result = await ticketService.closeTicket(req.params.id, req.body.reason);

      await auditService.logSensitiveOperation(req, 'TICKET_CLOSED', 'tickets', {
        ticketId: req.params.id,
        reason: req.body.reason,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Close ticket error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/tickets/:id/reopen - Reopen ticket
   */
  router.post('/:id/reopen', requirePermission('tickets:manage'), async (req, res) => {
    try {
      const result = await ticketService.reopenTicket(req.params.id);

      await auditService.logSensitiveOperation(req, 'TICKET_REOPENED', 'tickets', {
        ticketId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Reopen ticket error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/tickets/:id/history - Ticket history
   */
  router.get('/:id/history', requirePermission('tickets:view'), async (req, res) => {
    try {
      const result = await ticketService.getTicketHistory(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get ticket history error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}
