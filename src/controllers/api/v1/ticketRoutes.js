import express from 'express';
import { TicketController } from '../../dashboard/ticketController.js';

export const createTicketRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new TicketController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
