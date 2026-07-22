import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

import { config } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
});

export class StorageService {
  public async createPresignedPost(
    libraryId: string,
    userId: string,
    body: { fileName: string; contentType: string; fileSize: number }
  ) {
    const { fileName, contentType, fileSize } = body;

    if (fileSize > config.S3_PRESIGN_EXPIRES_IN * 1024) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'File too large', 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(contentType)) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Invalid file type', 400);
    }

    const key = `${libraryId}/${crypto.randomUUID()}-${fileName}`;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: config.AWS_S3_BUCKET,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10 * 1024 * 1024],
        ['starts-with', '$Content-Type', ''],
        ['eq', '$Content-Type', contentType]
      ],
      Fields: {
        'Content-Type': contentType
      },
      Expires: 300
    });

    return {
      url,
      fields,
      key,
      expiresIn: 300
    };
  }
}