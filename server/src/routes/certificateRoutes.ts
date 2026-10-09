import { Router } from 'express';
import {
  getMyCertificates,
  verifyCertificate,
  downloadCertificate,
} from '../controllers/certificateController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.get('/my-certificates', authenticate, authorize('student'), getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/:certificateId/download', downloadCertificate);

export default router;
