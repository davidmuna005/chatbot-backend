import express from 'express';
import { ParentController } from '../../dashboard/parentController.js';

export const createParentRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new ParentController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.remove.bind(controller));

  return router;
};
