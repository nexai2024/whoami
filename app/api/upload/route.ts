/**
 * POST /api/upload - Upload files to storage
 * Used by lead magnet creation and other features
 */

import { NextRequest, NextResponse } from 'next/server';
import storageService from '@/lib/services/storageService';
import path from 'path';

// Allowed file types
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx',
  'xls', 'xlsx',
  'zip',
  'mp4',
  'mp3',
  'jpg', 'jpeg', 'png'
];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'video/mp4',
  'audio/mpeg',
  'image/jpeg',
  'image/png'
];

const MAX_FILE_SIZE = 52428800; // 50MB in bytes

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type by extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'File type not supported. Allowed types: PDF, DOC, DOCX, XLS, XLSX, ZIP, MP4, MP3, JPG, PNG' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Allowed types: PDF, DOC, DOCX, XLS, XLSX, ZIP, MP4, MP3, JPG, PNG' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage
    try {
      const uploadResult = await storageService.uploadFile(
        buffer,
        file.name,
        {
          folder: 'lead-magnets',
          isPublic: true,
          contentType: file.type
        }
      );

      // Return file metadata
      return NextResponse.json({
        fileUrl: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });
    } catch (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'File upload failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
