import { Router } from 'express';
import {
  createBadge,
  getBadge,
  updateBadge,
} from '../controllers/adminBadgeController.js';

const router = Router();

router.get('/:badgeId', getBadge);
router.post('/', createBadge);
router.put('/:badgeId', updateBadge);

export default router;
