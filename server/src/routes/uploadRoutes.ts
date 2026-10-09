import { Router } from 'express';
import { handleFileUpload, multerUpload } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('teacher'),
  multerUpload.single('file'),
  handleFileUpload
);

export default router;
