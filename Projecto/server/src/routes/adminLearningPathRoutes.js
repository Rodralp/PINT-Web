import { Router } from 'express';
import {
  listLearningPaths,
  createLearningPath,
  updateLearningPath,
  createServiceLine,
  updateServiceLine,
  createArea,
  updateArea,
  createLevel,
  updateLevel,
} from '../controllers/adminLearningPathController.js';

const router = Router();

router.get('/', listLearningPaths);
router.post('/', createLearningPath);
router.put('/:learningPathId', updateLearningPath);
router.post('/:learningPathId/service-lines', createServiceLine);

router.put('/service-lines/:serviceLineId', updateServiceLine);
router.post('/service-lines/:serviceLineId/areas', createArea);

router.put('/areas/:areaId', updateArea);
router.post('/areas/:areaId/levels', createLevel);

router.put('/levels/:levelId', updateLevel);

export default router;
