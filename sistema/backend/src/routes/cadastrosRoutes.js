import { Router } from 'express';
import {
  listClientes, getCliente, createCliente, updateCliente, deleteCliente, updateCategoriaMatriz,
  listMatrizes, createMatriz, updateMatriz, deleteMatriz,
  listPartesPeca, createPartePeca, updatePartePeca, deletePartePeca,
  listPrecos, createPreco, updatePreco,
  listServicos, createServico, updateServico, deleteServico,
} from '../controllers/cadastrosController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate, servicoSchema, fechamentoPreviaSchema } from '../middlewares/validate.js';

const router = Router();
router.use(authMiddleware);

router.get('/clientes', listClientes);
router.get('/clientes/:id', getCliente);
router.post('/clientes', adminOnly, createCliente);
router.put('/clientes/:id', adminOnly, updateCliente);
router.delete('/clientes/:id', adminOnly, deleteCliente);
router.put('/clientes/:id/categoria-matriz', adminOnly, updateCategoriaMatriz);

router.get('/matrizes', listMatrizes);
router.post('/matrizes', adminOnly, createMatriz);
router.put('/matrizes/:id', adminOnly, updateMatriz);
router.delete('/matrizes/:id', adminOnly, deleteMatriz);

router.get('/partes-peca', listPartesPeca);
router.post('/partes-peca', adminOnly, createPartePeca);
router.put('/partes-peca/:id', adminOnly, updatePartePeca);
router.delete('/partes-peca/:id', adminOnly, deletePartePeca);

router.get('/precos', adminOnly, listPrecos);
router.post('/precos', adminOnly, createPreco);
router.put('/precos/:id', adminOnly, updatePreco);

router.get('/servicos', listServicos);
router.post('/servicos', validate(servicoSchema), createServico);
router.put('/servicos/:id', validate(servicoSchema), updateServico);
router.delete('/servicos/:id', deleteServico);

export default router;
