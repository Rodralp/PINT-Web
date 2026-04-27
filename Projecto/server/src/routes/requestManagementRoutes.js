import { Router } from 'express';
import {
  getManagedRequestById,
  getManagedRequests,
  submitManagedRequestDecision,
} from '../controllers/requestManagementController.js';

const router = Router();

router.get('/:role/requests', getManagedRequests);
router.get('/:role/requests/:requestId', getManagedRequestById);
router.post('/:role/requests/:requestId/decision', submitManagedRequestDecision);

export default router;
