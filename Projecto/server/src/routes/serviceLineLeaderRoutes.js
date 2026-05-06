import { Router } from 'express';
import {
  getMyServiceLine,
  getHistoricoAreasSLL,
  getHistoricoBadgesSLL,
  getHistoricoConsultoresSLL,
  getDetalhesConsultorSLL,
  getDetalhesBadgeSLL,
} from '../controllers/serviceLineLeaderController.js';

const router = Router();

router.get('/minha-service-line', getMyServiceLine);
router.get('/historico/areas', getHistoricoAreasSLL);
router.get('/historico/badges', getHistoricoBadgesSLL);
router.get('/historico/consultores', getHistoricoConsultoresSLL);
router.get('/historico/consultor', getDetalhesConsultorSLL);
router.get('/historico/badge', getDetalhesBadgeSLL);

export default router;
