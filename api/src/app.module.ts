import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { PostModule } from './modules/post/post.module'
import { S3Module } from './modules/s3/s3.module'
import { UploadModule } from './modules/upload/upload.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigService disponível em todos os módulos
      envFilePath: '.env'
    }),
    PrismaModule,
    AuthModule,
    PostModule,
    S3Module,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
