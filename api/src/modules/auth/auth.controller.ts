import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/refresh-toke.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { VerifyEmailDto } from './dto/verify-email.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId)
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto)
  }

  @Post('send-phone-code')
  async sendPhoneCode(@Body() body: { userId: string }) {
    return this.authService.sendPhoneCode(body.userId)
  }

  @Post('verify-phone')
  async verifyPhone(@Body() body: { userId: string; code: string }) {
    return this.authService.verifyPhone(body.userId, { code: body.code })
  }
}
