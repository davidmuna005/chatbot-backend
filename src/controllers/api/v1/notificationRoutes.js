import express from 'express';
import { NotificationController } from '../../dashboard/notificationController.js';

export const createNotificationRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new NotificationController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
