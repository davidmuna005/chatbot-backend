import express from 'express';
import { AttendanceController } from '../../dashboard/attendanceController.js';

export const createAttendanceRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new AttendanceController(dependencies);

  router.get('/', controller.list.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));

  return router;
};
