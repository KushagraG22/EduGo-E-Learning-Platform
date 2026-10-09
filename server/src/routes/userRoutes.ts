import { Router } from 'express';
import { updateProfile, getPublicTeacherProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.put('/profile', authenticate, updateProfile);
router.get('/teachers/:teacherId', getPublicTeacherProfile);

export default router;
