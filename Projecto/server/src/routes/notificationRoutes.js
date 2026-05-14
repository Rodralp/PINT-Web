import { Router } from 'express';
import { getUserNotifications, markNotificationRead } from '../controllers/notificationController.js';

const router = Router();

router.get('/', getUserNotifications);
router.patch('/:notificationId/read', markNotificationRead);

export default router;
