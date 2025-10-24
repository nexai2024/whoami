/**
 * Storage Service
 * Handles file uploads to cloud storage (S3/R2)
 * Used by Content Repurposing and Lead Magnet features
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 client (compatible with both AWS S3 and Cloudflare R2)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT, // Optional, for R2
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const CDN_URL = process.env.CDN_URL || '';

export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Generate a unique filename with timestamp and random string
 */
function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const sanitized = basename
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 50);

  return `${sanitized}-${timestamp}-${random}${ext}`;
}

/**
 * Upload a file buffer to storage
 */
export async function uploadFile(
  buffer: Buffer,
  originalFilename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'uploads',
    filename = generateUniqueFilename(originalFilename),
    contentType = 'application/octet-stream',
    isPublic = true,
    metadata = {},
  } = options;

  const key = `${folder}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: isPublic ? 'public-read' : 'private',
    Metadata: metadata,
  });

  try {
    await s3Client.send(command);

    const url = CDN_URL
      ? `${CDN_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      key,
      url,
      size: buffer.length,
      contentType,
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${(error as Error).message}`);
  }
}

/**
 * Upload a file from a URL
 */
export async function uploadFromUrl(
  sourceUrl: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Extract filename from URL or use default
    const urlPath = new URL(sourceUrl).pathname;
    const urlFilename = path.basename(urlPath) || 'download';

    return uploadFile(buffer, urlFilename, {
      ...options,
      contentType,
    });
  } catch (error) {
    throw new Error(`Failed to upload from URL: ${(error as Error).message}`);
  }
}

/**
 * Generate a presigned URL for direct upload from client
 */
export async function generateUploadUrl(
  filename: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const { folder = 'uploads' } = options;
  const uniqueFilename = generateUniqueFilename(filename);
  const key = `${folder}/${uniqueFilename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: options.isPublic !== false ? 'public-read' : 'private',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  const publicUrl = CDN_URL
    ? `${CDN_URL}/${key}`
    : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}

/**
 * Generate a presigned URL for downloading a private file
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    throw new Error(`Failed to delete file: ${(error as Error).message}`);
  }
}

/**
 * Get public URL for a file key
 */
export function getPublicUrl(key: string): string {
  if (CDN_URL) {
    return `${CDN_URL}/${key}`;
  }

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

/**
 * Upload multiple files in parallel
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; filename: string; contentType?: string }>,
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const uploads = files.map((file) =>
    uploadFile(file.buffer, file.filename, {
      ...options,
      contentType: file.contentType,
    })
  );

  return Promise.all(uploads);
}

/**
 * Validate file type
 */
export function validateFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const ext = path.extname(filename).toLowerCase().substring(1);
  return allowedTypes.includes(ext);
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSizeMB: number
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Check if storage is configured
 */
export function isConfigured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    BUCKET_NAME
  );
}

// export default {
//   uploadFile,
//   uploadFromUrl,
//   generateUploadUrl,
//   generateDownloadUrl,
//   deleteFile,
//   getPublicUrl,
//   uploadMultipleFiles,
//   validateFileType,
//   validateFileSize,
//   isConfigured,
// };
