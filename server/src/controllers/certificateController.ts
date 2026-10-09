import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Certificate } from '../models/Certificate';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMyCertificates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const certificates = await Certificate.find({ studentId: req.user._id })
      .populate('courseId', 'title slug thumbnail category')
      .sort({ completionDate: -1 });

    res.status(200).json({
      success: true,
      certificates,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      res.status(400).json({ success: false, message: 'Certificate ID is required' });
      return;
    }

    const cert = await Certificate.findOne({
      certificateId: certificateId.trim().toUpperCase(),
    });

    if (!cert) {
      res.status(404).json({
        success: false,
        isValid: false,
        message: 'No certificate found with this verification ID.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      isValid: true,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        teacherName: cert.teacherName,
        completionDate: cert.completionDate,
        verificationUrl: cert.verificationUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({
      certificateId: certificateId.trim().toUpperCase(),
    });

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found' });
      return;
    }

    const filePath = path.resolve(__dirname, '../../uploads/certificates', `${cert.certificateId}.pdf`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'Certificate file could not be found on server storage.',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="EduGo-Certificate-${cert.certificateId}.pdf"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
