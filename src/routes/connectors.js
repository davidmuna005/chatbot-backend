import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    connectors: [
      { id: 'mysql', name: 'MySQL', supported: true },
      { id: 'postgres', name: 'PostgreSQL', supported: true },
      { id: 'sqlserver', name: 'SQL Server', supported: true },
      { id: 'oracle', name: 'Oracle', supported: true },
      { id: 'sqlite', name: 'SQLite', supported: true }
    ]
  });
});

router.post('/test', (req, res) => {
  const { engine } = req.body;
  res.json({ success: true, engine, message: 'Connector configuration received' });
});

export default router;
