import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')

        if (!secret) {
          throw new Error(
            '❌ JWT_SECRET não está definido no arquivo .env! ' +
              "Execute: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
          )
        }

        return {
          secret,
          signOptions: { expiresIn: '15m' }
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
