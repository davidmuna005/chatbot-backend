import express from 'express';
import { DisciplineController } from '../../dashboard/disciplineController.js';

export const createDisciplineRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new DisciplineController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
