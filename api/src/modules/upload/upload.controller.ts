import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { S3Service } from '../s3/s3.service'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService
  ) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido')
    }

    // Validações
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande (máximo 5MB)')
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo inválido. Use JPEG, PNG, WEBP ou GIF'
      )
    }

    // Gera nome único
    const uniqueFilename = this.s3Service.generateUniqueFilename(
      file.originalname
    )

    // Upload para S3
    const result = await this.s3Service.uploadFile(
      file.buffer,
      uniqueFilename,
      {
        folder: 'avatars',
        contentType: file.mimetype,
        isPublic: true,
        metadata: {
          userId: req.user.userId,
          originalName: file.originalname
        }
      }
    )

    // Atualiza avatar do usuário no banco
    const userId = req.user.userId
    await this.prisma.users.update({
      where: { id: userId },
      data: { avatar_url: result.url }
    })

    return {
      message: 'Avatar atualizado com sucesso',
      url: result.url,
      key: result.key
    }
  }

  @Post('post-media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPostMedia(
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido')
    }

    // Validações
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande (máximo 10MB)')
    }

    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ]
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo inválido. Use imagens (JPEG, PNG, WEBP, GIF) ou vídeos (MP4, WEBM)'
      )
    }

    // Gera nome único
    const uniqueFilename = this.s3Service.generateUniqueFilename(
      file.originalname
    )

    // Upload para S3
    const result = await this.s3Service.uploadFile(
      file.buffer,
      uniqueFilename,
      {
        folder: 'posts',
        contentType: file.mimetype,
        isPublic: true,
        metadata: {
          userId: req.user.userId,
          originalName: file.originalname
        }
      }
    )

    return {
      message: 'Mídia enviada com sucesso',
      url: result.url,
      key: result.key,
      type: file.mimetype.startsWith('image') ? 'image' : 'video'
    }
  }
}
