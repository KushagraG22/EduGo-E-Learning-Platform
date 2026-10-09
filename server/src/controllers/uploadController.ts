import { Response, NextFunction } from 'express';
import multer from 'multer';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadFile } from '../services/storageService';

const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Documents
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not permitted.`));
    }
  },
});

export const handleFileUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file was uploaded.' });
      return;
    }

    const folder = req.body.folder || 'media';
    const result = await uploadFile(req.file, folder);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: result.url,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        provider: result.provider,
      },
    });
  } catch (error) {
    next(error);
  }
};
