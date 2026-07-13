import express from 'express';
import { ConfigurationController } from '../../dashboard/configurationController.js';

export const createConfigurationRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new ConfigurationController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
