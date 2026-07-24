import { Router } from 'express';
import { createPlatformArchitecture } from './index.js';

export const createArchitectureRoutes = (dependencies = {}) => {
  const router = Router();
  const architecture = createPlatformArchitecture(dependencies);

  router.get('/architecture/platform', (_req, res) => {
    res.json({
      success: true,
      architecture: {
        platform: {
          schoolRegistry: true,
          connectorRegistry: true,
          apiGateway: true,
          schoolRouter: true,
          heartbeatService: true
        },
        schoolServer: {
          secureApi: true,
          schoolDatabase: 'external'
        }
      }
    });
  });

  router.post('/architecture/schools/register', (req, res) => {
    const school = architecture.schoolRegistry.registerSchool(req.body);
    res.json({ success: true, school });
  });

  router.post('/architecture/heartbeat', (req, res) => {
    const result = architecture.heartbeatService.reportHeartbeat(req.body.schoolId, req.body);
    res.json(result);
  });

  router.post('/architecture/route', async (req, res) => {
    const result = await architecture.schoolRouter.route(req.body);
    res.json(result);
  });

  return router;
};

export default createArchitectureRoutes;
