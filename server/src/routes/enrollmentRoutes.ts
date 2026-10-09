import { Router } from 'express';
import { getMyLearning, getLearningHistory } from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.get('/my-learning', authenticate, authorize('student'), getMyLearning);
router.get('/history', authenticate, authorize('student'), getLearningHistory);

export default router;
