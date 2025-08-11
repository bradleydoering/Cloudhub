import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'placeholder-account'
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'placeholder-key'
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'placeholder-secret'
const R2_BUCKET = process.env.R2_BUCKET || 'cloudhub-files'

let r2Client: S3Client | null = null

// Create R2 client lazily
function getR2Client(): S3Client {
  if (!r2Client) {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('Missing R2 configuration environment variables')
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return r2Client
}

export interface FileUploadOptions {
  projectId?: string
  organizationId: string
  fileType: 'document' | 'photo' | 'avatar'
  contentType: string
  fileSize: number
  fileName: string
}

export interface SignedUploadResponse {
  uploadUrl: string
  fileKey: string
  publicUrl: string
  expiresIn: number
}

// Generate signed upload URL for client-side upload
export async function generateSignedUploadUrl(
  options: FileUploadOptions,
  expiresIn = 3600 // 1 hour
): Promise<SignedUploadResponse> {
  const timestamp = Date.now()
  const fileExtension = options.fileName.split('.').pop()
  const sanitizedFileName = options.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  // Generate organized file key
  const fileKey = [
    options.organizationId,
    options.fileType === 'avatar' ? 'avatars' : options.fileType + 's',
    options.projectId && options.fileType !== 'avatar' ? options.projectId : null,
    `${timestamp}_${sanitizedFileName}`
  ].filter(Boolean).join('/')

  // Create upload command
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
    ContentType: options.contentType,
    ContentLength: options.fileSize,
    Metadata: {
      'original-name': options.fileName,
      'file-type': options.fileType,
      'organization-id': options.organizationId,
      ...(options.projectId && { 'project-id': options.projectId })
    }
  })

  // Generate signed URL
  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn })
  
  // Generate public URL (for R2 with custom domain or public bucket)
  const publicUrl = `https://files.cloudhub.com/${fileKey}` // Replace with your R2 custom domain

  return {
    uploadUrl,
    fileKey,
    publicUrl,
    expiresIn
  }
}

// Generate signed download URL for private files
export async function generateSignedDownloadUrl(
  fileKey: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
  })

  return await getSignedUrl(getR2Client(), command, { expiresIn })
}

// Delete file from R2
export async function deleteFile(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileKey,
  })

  await getR2Client().send(command)
}

// Validate file type and size
export function validateFile(file: File, allowedTypes: string[], maxSizeMB: number): string | null {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${maxSizeMB}MB`
  }

  return null
}

// File type configurations
export const FILE_CONFIGS = {
  document: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    maxSizeMB: 50
  },
  photo: {
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic'
    ],
    maxSizeMB: 25
  },
  avatar: {
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    maxSizeMB: 5
  }
} as const