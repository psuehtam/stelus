import { Router } from 'express';
import { login, me, listUsuarios, createUsuario, updateUsuario } from '../controllers/authController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.get('/usuarios', authMiddleware, adminOnly, listUsuarios);
router.post('/usuarios', authMiddleware, adminOnly, createUsuario);
router.put('/usuarios/:id', authMiddleware, adminOnly, updateUsuario);

export default router;
