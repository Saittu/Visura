import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

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

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client
  private readonly bucket: string
  private readonly publicUrl: string
  private readonly logger = new Logger(S3Service.name)

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('s3.region')
    const accessKeyId = this.configService.get<string>('s3.accessKeyId')
    const secretAccessKey = this.configService.get<string>('s3.secretAccessKey')

    this.bucket = this.configService.get<string>('s3.bucket') || ''
    this.publicUrl = this.configService.get<string>('s3.publicUrl') || ''

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not configured. S3 operations will fail.'
      )
    }

    this.s3Client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey
            }
          : undefined
    })
  }

  async uploadFile(
    file: Buffer | Readable,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      folder = 'uploads',
      contentType = 'application/octet-stream',
      isPublic = true,
      metadata = {}
    } = options

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = folder ? `${folder}/${sanitizedFilename}` : sanitizedFilename

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file,
          ContentType: contentType,
          ACL: isPublic ? 'public-read' : 'private',
          Metadata: metadata
        }
      })

      await upload.done()

      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `https://${this.bucket}.s3.${this.configService.get<string>('s3.region')}.amazonaws.com/${key}`

      this.logger.log(`File uploaded successfully: ${key}`)

      return {
        key,
        url,
        bucket: this.bucket
      }
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack)
      throw new Error(`S3 upload failed: ${error.message}`)
    }
  }

  async downloadFile(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      const response = await this.s3Client.send(command)
      return response.Body as Readable
    } catch (error) {
      this.logger.error(
        `Failed to download file: ${error.message}`,
        error.stack
      )
      throw new Error(`S3 download failed: ${error.message}`)
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.s3Client.send(command)
      this.logger.log(`File deleted successfully: ${key}`)
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack)
      throw new Error(`S3 delete failed: ${error.message}`)
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      if (error.name === 'NotFound') {
        return false
      }
      throw error
    }
  }

  generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalFilename.split('.').pop()
    const baseName = originalFilename.split('.').slice(0, -1).join('.')

    return `${baseName}-${timestamp}-${randomString}.${extension}`
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname

      return pathname.startsWith('/') ? pathname.slice(1) : pathname
    } catch {
      return null
    }
  }
}
