import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = Boolean(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  logger.info('[StorageService] Cloudinary cloud storage configured.');
} else {
  logger.info('[StorageService] Cloudinary not configured; using local storage adapter.');
}

// Ensure local uploads directory exists
const localUploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  bytes: number;
  format?: string;
  provider: 'cloudinary' | 'local';
}

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'edugo'
): Promise<UploadResult> => {
  if (isCloudinaryConfigured) {
    try {
      return await new Promise<UploadResult>((resolve, reject) => {
        const resourceType = file.mimetype.startsWith('video/')
          ? 'video'
          : file.mimetype.startsWith('image/')
          ? 'image'
          : 'raw';

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload to Cloudinary failed'));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              bytes: result.bytes,
              format: result.format,
              provider: 'cloudinary',
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      logger.error('[StorageService] Cloudinary upload error, falling back to local:', err);
    }
  }

  // Local storage provider
  const subDir = path.join(localUploadsDir, folder);
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname) || '';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
  const filePath = path.join(subDir, uniqueName);

  fs.writeFileSync(filePath, file.buffer);

  const relativeUrl = `/uploads/${folder}/${uniqueName}`;
  return {
    url: relativeUrl,
    bytes: file.size,
    format: fileExtension.replace('.', ''),
    provider: 'local',
  };
};
