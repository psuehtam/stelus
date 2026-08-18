import { Router } from 'express';
import {
  previaFechamento, confirmar, listFechamentos, getFechamento, updateFechamento, registrarPagamento,
} from '../controllers/fechamentoController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate, fechamentoPreviaSchema } from '../middlewares/validate.js';

const router = Router();
router.use(authMiddleware, adminOnly);

router.post('/previa', validate(fechamentoPreviaSchema), previaFechamento);
router.post('/confirmar', validate(fechamentoPreviaSchema), confirmar);
router.get('/', listFechamentos);
router.get('/:id', getFechamento);
router.put('/:id', updateFechamento);
router.post('/:id/pagamentos', registrarPagamento);

export default router;
