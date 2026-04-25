import { Router } from 'express';
import { getMyServiceLine } from '../controllers/serviceLineLeaderController.js';

const router = Router();

router.get('/minha-service-line', getMyServiceLine);

export default router;
