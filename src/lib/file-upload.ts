import { writeFile, mkdir, access, constants } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

interface UploadResult {
  filename: string;
  path: string;
  size: number;
  originalName: string;
}

/**
 * Uploads a file to the specified directory
 * @param fileBuffer - Buffer containing the file data
 * @param originalName - Original name of the file
 * @param uploadDir - Directory to upload the file to
 * @returns Information about the uploaded file
 */
export async function uploadFile(
  fileBuffer: Buffer,
  originalName: string,
  uploadDir: string
): Promise<UploadResult> {
  // Create upload directory if it doesn't exist
  try {
    await access(uploadDir, constants.F_OK);
  } catch {
    await mkdir(uploadDir, { recursive: true });
  }

  // Generate a unique filename
  const fileExtension = path.extname(originalName);
  const uniqueFilename = `${randomUUID()}${fileExtension}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  // Write the file
  await writeFile(filePath, fileBuffer);

  // Get file stats
  const size = fileBuffer.length;

  return {
    filename: uniqueFilename,
    path: filePath,
    size,
    originalName,
  };
}

/**
 * Validates file type for avatar uploads
 * @param mimeType - MIME type of the file
 * @param allowedTypes - Array of allowed MIME types
 * @returns Whether the file type is allowed
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
): boolean {
  return allowedTypes.includes(mimeType);
}