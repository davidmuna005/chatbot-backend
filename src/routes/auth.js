import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.json({
      token: 'demo-jwt-token',
      user: {
        id: '1',
        role: 'school_admin',
        name: 'Demo Administrator'
      }
    });
    return;
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

router.get('/me', (_req, res) => {
  res.json({ user: { id: '1', role: 'school_admin', name: 'Demo Administrator' } });
});

export default router;
