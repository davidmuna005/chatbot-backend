import express from 'express';
import { createAuthRouter } from './authRoutes.js';
import { createParentRouter } from './parentRoutes.js';
import { createStudentRouter } from './studentRoutes.js';
import { createAttendanceRouter } from './attendanceRoutes.js';
import { createResultsRouter } from './resultsRoutes.js';
import { createFeeRouter } from './feeRoutes.js';
import { createDisciplineRouter } from './disciplineRoutes.js';
import { createTicketRouter } from './ticketRoutes.js';
import { createConfigurationRouter } from './configurationRoutes.js';
import { createAnalyticsRouter } from './analyticsRoutes.js';
import { createNotificationRouter } from './notificationRoutes.js';

export const createApiV1Router = (dependencies = {}) => {
  const router = express.Router();

  router.use('/auth', createAuthRouter(dependencies));
  router.use('/parents', createParentRouter(dependencies));
  router.use('/students', createStudentRouter(dependencies));
  router.use('/attendance', createAttendanceRouter(dependencies));
  router.use('/results', createResultsRouter(dependencies));
  router.use('/fees', createFeeRouter(dependencies));
  router.use('/discipline', createDisciplineRouter(dependencies));
  router.use('/tickets', createTicketRouter(dependencies));
  router.use('/configuration', createConfigurationRouter(dependencies));
  router.use('/analytics', createAnalyticsRouter(dependencies));
  router.use('/notifications', createNotificationRouter(dependencies));

  return router;
};
