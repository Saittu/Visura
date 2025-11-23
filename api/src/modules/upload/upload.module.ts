import { Module } from '@nestjs/common'
import { UploadController } from './upload.controller'
import { S3Module } from '../s3/s3.module'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [S3Module, PrismaModule],
  controllers: [UploadController]
})
export class UploadModule {}
