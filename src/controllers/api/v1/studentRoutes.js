import express from 'express';
import { StudentController } from '../../dashboard/studentController.js';

export const createStudentRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new StudentController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.remove.bind(controller));

  return router;
};
