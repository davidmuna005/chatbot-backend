import { Router } from 'express';
import { AuthController } from '../controllers/auth.js';
import { verifyToken } from '../middleware/rbac.js';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
