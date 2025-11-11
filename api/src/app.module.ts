import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { PostModule } from './modules/post/post.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigService disponível em todos os módulos
      envFilePath: '.env'
    }),
    PrismaModule,
    AuthModule,
    PostModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
