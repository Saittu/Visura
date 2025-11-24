import { Module } from '@nestjs/common'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { S3Module } from '../s3/s3.module'

@Module({
  imports: [PrismaModule, S3Module],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService]
})
export class PostModule {}
