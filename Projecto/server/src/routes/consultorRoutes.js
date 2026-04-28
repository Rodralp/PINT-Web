import { Router } from 'express';
import {
  acquireBadge,
  getBadgeSuggestions,
  getPreferenceAreas,
  getPreferences,
  createReminder,
  deleteReminder,
  getCatalogBadges,
  getLearningPaths,
  getMyBadges,
  getMyRequests,
  getProfileData,
  getRankingConsultores,
  getReminders,
  savePreferences,
  updateReminder,
} from '../controllers/consultorController.js';

const router = Router();

router.get('/catalog-badges', getCatalogBadges);
router.get('/learning-paths', getLearningPaths);
router.get('/meus-badges', getMyBadges);
router.post('/badges/:badgeId/adquirir', acquireBadge);
router.get('/preferencias/areas', getPreferenceAreas);
router.get('/preferencias', getPreferences);
router.put('/preferencias', savePreferences);
router.get('/sugestoes', getBadgeSuggestions);
router.get('/meus-pedidos', getMyRequests);
router.get('/ranking', getRankingConsultores);
router.get('/lembretes', getReminders);
router.post('/lembretes', createReminder);
router.put('/lembretes/:id', updateReminder);
router.delete('/lembretes/:id', deleteReminder);
router.get('/profile', getProfileData);

export default router;
