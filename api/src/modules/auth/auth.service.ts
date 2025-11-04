import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenResponse } from './interface/token.interface'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.validateUser(dto.email, dto.password)
    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const payload = { sub: user.id, email: user.email }
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' })
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const decoded = this.jwtService.verify(refreshToken)
    const payload = { sub: decoded.sub, email: decoded.email }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' })
    }
  }

  private async validateUser(email: string, password: string) {
    // Aqui você consultaria o banco
    if (email === 'admin@teste.com' && password === '123456')
      return { id: '1', email }
    return null
  }
}
