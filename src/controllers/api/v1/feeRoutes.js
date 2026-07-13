import express from 'express';
import { FeeController } from '../../dashboard/feeController.js';

export const createFeeRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new FeeController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
