/**
 * Storage Service
 * Handles file uploads using UploadThing with a local fallback
 * Used by Content Repurposing and Lead Magnet features
 */

import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { File as NodeFile } from 'buffer';
import { UTApi } from 'uploadthing/server';

const isUploadThingConfigured =
  Boolean(process.env.UPLOADTHING_SECRET) && Boolean(process.env.UPLOADTHING_APP_ID);

const STORAGE_MODE: 'uploadthing' | 'local' = isUploadThingConfigured ? 'uploadthing' : 'local';

// Initialize UploadThing API client when credentials are present
const utapi = isUploadThingConfigured ? new UTApi() : null;

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
async function uploadToLocal(
  buffer: Buffer,
  originalFilename: string,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    folder = 'uploads',
    filename = generateUniqueFilename(originalFilename),
    contentType = 'application/octet-stream',
  } = options;

  const uploadDir = path.join(process.cwd(), 'public', folder);

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  const key = `${folder}/${filename}`;
  const urlPath = `/${key}`;

  return {
    key,
    url: urlPath,
    size: buffer.length,
    contentType,
  };
}

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

  if (STORAGE_MODE === 'uploadthing' && utapi) {
    const uploadFilename = filename || generateUniqueFilename(originalFilename);
    const fileForUpload = new NodeFile([buffer], uploadFilename, { type: contentType });
    const uploadResponse = await utapi.uploadFiles(fileForUpload);

    if (uploadResponse.error || !uploadResponse.data) {
      throw new Error(uploadResponse.error?.message || 'UploadThing upload failed');
    }

    const uploadedFile = Array.isArray(uploadResponse.data)
      ? uploadResponse.data[0]
      : uploadResponse.data;

    return {
      key: uploadedFile.key,
      url: uploadedFile.url,
      size: uploadedFile.size,
      contentType: uploadedFile.type || contentType,
    };
  }

  if (STORAGE_MODE === 'local') {
    return uploadToLocal(buffer, originalFilename, {
      folder,
      filename,
      contentType,
      isPublic,
      metadata,
    });
  }

  throw new Error('Storage client not configured');
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
  if (STORAGE_MODE === 'uploadthing') {
    throw new Error('Direct upload URLs are managed client-side via UploadThing components.');
  }

  throw new Error('Direct upload URLs are not supported without UploadThing configuration.');
}

/**
 * Generate a presigned URL for downloading a private file
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (STORAGE_MODE === 'uploadthing') {
    return `https://utfs.io/f/${key}`;
  }

  if (STORAGE_MODE === 'local') {
    return `/${key}`;
  }

  throw new Error('Download URLs are not available without storage configuration.');
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  if (STORAGE_MODE === 'uploadthing' && utapi) {
    await utapi.deleteFiles(key);
    return;
  }

  if (STORAGE_MODE === 'local') {
    const filePath = path.join(process.cwd(), 'public', key);
    await fs.unlink(filePath).catch(() => undefined);
    return;
  }

  throw new Error('Storage client not configured');
}

/**
 * Get public URL for a file key
 */
export function getPublicUrl(key: string): string {
  if (STORAGE_MODE === 'uploadthing') {
    return `https://utfs.io/f/${key}`;
  }

  if (STORAGE_MODE === 'local') {
    return `/${key}`;
  }

  throw new Error('Storage client not configured');
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
  return STORAGE_MODE === 'uploadthing';
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
