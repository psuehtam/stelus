import { Router } from 'express';
import { login, logout, me, listUsuarios, createUsuario, updateUsuario } from '../controllers/authController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { loginRateLimit } from '../middlewares/loginRateLimit.js';

const router = Router();

router.post('/login', loginRateLimit, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.get('/usuarios', authMiddleware, adminOnly, listUsuarios);
router.post('/usuarios', authMiddleware, adminOnly, createUsuario);
router.put('/usuarios/:id', authMiddleware, adminOnly, updateUsuario);

export default router;
