export interface UploadOptions {
  folder?: string
  contentType?: string
  isPublic?: boolean
  metadata?: Record<string, string>
}

export interface UploadResult {
  key: string
  url: string
  bucket: string
}

export interface UploadAvatarResponse {
  message: string
  url: string
  key: string
}

export interface UploadPostMediaResponse {
  message: string
  url: string
  key: string
  type: 'image' | 'video'
}

export interface DeleteFileResponse {
  message: string
  key: string
}
