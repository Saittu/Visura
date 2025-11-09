import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { TokenPayload } from './interface/token.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')

    if (!secret) {
      throw new Error('❌ JWT_SECRET não está definido no arquivo .env!')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret
    })
  }

  async validate(payload: TokenPayload) {
    // O retorno aqui será anexado ao request (req.user)
    return { userId: payload.sub, email: payload.email }
  }
}
