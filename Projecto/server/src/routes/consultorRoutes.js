import { Router } from 'express';
import {
  createReminder,
  deleteReminder,
  getCatalogBadges,
  getMyBadges,
  getMyRequests,
  getProfileData,
  getRankingConsultores,
  getReminders,
  updateReminder,
} from '../controllers/consultorController.js';

const router = Router();

router.get('/catalog-badges', getCatalogBadges);
router.get('/meus-badges', getMyBadges);
router.get('/meus-pedidos', getMyRequests);
router.get('/ranking', getRankingConsultores);
router.get('/lembretes', getReminders);
router.post('/lembretes', createReminder);
router.put('/lembretes/:id', updateReminder);
router.delete('/lembretes/:id', deleteReminder);
router.get('/profile', getProfileData);

export default router;
