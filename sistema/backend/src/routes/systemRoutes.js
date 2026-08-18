import { Router } from 'express';
import {
  getConfig, updateConfig, dashboard, relatorioOperacional, relatorioOperacionalPdf,
} from '../controllers/dashboardController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', authMiddleware, adminOnly, dashboard);
router.get('/relatorio-operacional/pdf', authMiddleware, relatorioOperacionalPdf);
router.get('/relatorio-operacional', authMiddleware, relatorioOperacional);
router.get('/config', authMiddleware, adminOnly, getConfig);
router.put('/config', authMiddleware, adminOnly, updateConfig);

export default router;
