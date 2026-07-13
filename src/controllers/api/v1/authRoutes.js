import express from 'express';
import { AuthController } from '../../auth.js';

export const createAuthRouter = (dependencies = {}) => {
  const router = express.Router();
  const controller = new AuthController(dependencies);

  router.post('/login', controller.login.bind(controller));
  router.post('/logout', controller.logout.bind(controller));
  router.post('/refresh', controller.refresh.bind(controller));

  return router;
};
