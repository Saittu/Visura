import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenResponse } from './interface/token.interface'
import { LoginDto } from './dto/login.dto'
import { PrismaService } from '../../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcrypt'
import { MailService } from '../notifications/services/mail.service'
import { SmsService } from '../notifications/services/sms.service'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { VerifyPhoneDto } from './dto/verify-phone.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponse> {
    const existingEmail = await this.prisma.users.findUnique({
      where: { email: dto.email }
    })

    if (existingEmail) {
      throw new ConflictException('Email já cadastrado')
    }

    const existingUsername = await this.prisma.users.findUnique({
      where: { username: dto.username }
    })

    if (existingUsername) {
      throw new ConflictException('Nome de usuário já cadastrado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        username: dto.username,
        name: dto.name,
        telephone: dto.telephone,
        password_hash: passwordHash
      }
    })

    await Promise.allSettled([
      this.createAndSendEmailVerification(user.id, user.email),
      this.createAndSendPhoneCode(user.id, dto.telephone)
    ])

    const tokens = await this.generateTokens(user.id, user.email)

    return {
      ...tokens,
      userId: user.id
    }
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email }
    })

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos.')
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password_hash ? user.password_hash : ''
    )

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha inválidos.')
    }

    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Email não verificado. Verifique seu email para continuar.'
      )
    }
    if (!user.telephone) {
      throw new UnauthorizedException('Telefone não cadastrado.')
    }
    if (!(user as any).phone_verified) {
      throw new UnauthorizedException(
        'Telefone não verificado. Envie e valide o código por SMS.'
      )
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    })

    return this.generateTokens(user.id, user.email)
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = this.jwtService.verify(refreshToken)

      const user = await this.prisma.users.findUnique({
        where: { id: decoded.sub }
      })

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado.')
      }

      return this.generateTokens(user.id, user.email)
    } catch {
      throw new UnauthorizedException('Token inválido.')
    }
  }

  async createAndSendEmailVerification(userId: string, email: string) {
    // Gera código 6 dígitos (igual ao SMS)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeHash = await bcrypt.hash(code, 10)

    // Cria registro do token com 15 minutos de validade
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await this.prisma.email_tokens.create({
      data: {
        user_id: userId,
        token_hash: codeHash,
        purpose: 'verify-email',
        expires_at: expiresAt
      }
    })

    const html = `
      <h2>Bem-vindo ao Visura!</h2>
      <p>Seu código de verificação de email é:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${code}</h1>
      <p>Válido por 15 minutos.</p>
      <p>Se você não solicitou este código, ignore este email.</p>
    `

    await this.mailService.sendVerificationEmail(
      email,
      'Código de verificação - Visura',
      html
    )
  }

  async verifyEmail(dto: VerifyEmailDto) {
    // Busca o último token não consumido do usuário pelo código
    const record = await this.prisma.email_tokens.findFirst({
      where: {
        purpose: 'verify-email',
        consumed: false
      },
      orderBy: { created_at: 'desc' }
    })

    if (!record)
      throw new BadRequestException('Código inválido ou já utilizado')
    if (new Date(record.expires_at) < new Date())
      throw new BadRequestException('Código expirado')

    const ok = await bcrypt.compare(dto.code, record.token_hash)
    if (!ok) throw new BadRequestException('Código inválido')

    // Marca token como consumido e atualiza usuário
    await this.prisma.$transaction([
      this.prisma.email_tokens.update({
        where: { id: record.id },
        data: { consumed: true, consumed_at: new Date() }
      }),
      this.prisma.users.update({
        where: { id: record.user_id! },
        data: { email_verified: true }
      })
    ])

    return { message: 'Email verificado com sucesso' }
  }

  async createAndSendPhoneCode(userId: string, telephone: string) {
    // Gera código 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    await this.prisma.phone_tokens.create({
      data: {
        user_id: userId,
        code_hash: codeHash,
        expire_at: expiresAt
      }
    })

    await this.smsService.sendSms(
      telephone,
      `Seu código de verificação Visura é: ${code}. Válido por 10 minutos.`
    )
  }

  async sendPhoneCode(userId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } })
    if (!user || !user.telephone)
      throw new BadRequestException('Telefone não encontrado')
    await this.createAndSendPhoneCode(user.id, user.telephone)
    return { message: 'Código enviado por SMS' }
  }

  async verifyPhone(userId: string, dto: VerifyPhoneDto) {
    // Busca o último token não consumido do usuário
    const token = await this.prisma.phone_tokens.findFirst({
      where: { user_id: userId, consumed: false },
      orderBy: { created_at: 'desc' }
    })
    if (!token) throw new BadRequestException('Código inválido')
    if (new Date(token.expire_at) < new Date())
      throw new BadRequestException('Código expirado')

    const ok = await bcrypt.compare(dto.code, token.code_hash)
    if (!ok) throw new BadRequestException('Código inválido')

    await this.prisma.phone_tokens.update({
      where: { id: token.id },
      data: { consumed: true }
    })

    // Marca usuário como com telefone verificado
    await this.prisma.users.update({
      where: { id: userId },
      data: { phone_verified: true } as any
    })

    return { message: 'Telefone verificado com sucesso' }
  }

  private async generateTokens(
    userId: string,
    email: string
  ): Promise<TokenResponse> {
    const payload = { sub: userId, email }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m'
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d'
    })

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    await this.prisma.sessions.create({
      data: {
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      }
    })

    return { accessToken, refreshToken }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        telephone: true,
        bio: true,
        avatar_url: true,
        email_verified: true,
        phone_verified: true,
        created_at: true,
        last_login_at: true
      }
    })

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.')
    }

    return user
  }
}
