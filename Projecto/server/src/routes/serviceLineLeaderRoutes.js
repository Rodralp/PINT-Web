import { Router } from 'express';
import {
  getHistoricoAreasSLL,
  getHistoricoBadgesSLL,
  getHistoricoConsultoresSLL,
  getDetalhesConsultorSLL,
  getDetalhesBadgeSLL,
} from '../controllers/serviceLineLeaderController.js';

const router = Router();

router.get('/historico/areas', getHistoricoAreasSLL);
router.get('/historico/badges', getHistoricoBadgesSLL);
router.get('/historico/consultores', getHistoricoConsultoresSLL);
router.get('/historico/consultor', getDetalhesConsultorSLL);
router.get('/historico/badge', getDetalhesBadgeSLL);

export default router;
