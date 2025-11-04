import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { TokenPayload } from './interface/token.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'chave_secreta_aqui'
    })
  }

  async validate(payload: TokenPayload) {
    // O retorno aqui será anexado ao request (req.user)
    return { userId: payload.sub, email: payload.email }
  }
}
