import express from 'express';
import { ResultsController } from '../../dashboard/resultsController.js';

export const createResultsRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new ResultsController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
