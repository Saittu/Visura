import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  VerifyPhoneDto,
  AuthResult,
  MessageResponse,
  User
} from '../types/auth.types'

/**
 * Interface de contrato para serviços de autenticação.
 * O frontend depende apenas desta interface, não da implementação.
 * Permite trocar backend (NestJS, Firebase, Supabase, etc.) sem afetar o código do cliente.
 */
export interface IAuthService {
  /**
   * Registra um novo usuário
   */
  register(data: RegisterDto): Promise<AuthResult>

  /**
   * Autentica um usuário existente
   */
  login(credentials: LoginDto): Promise<AuthResult>

  /**
   * Verifica o código de e-mail enviado ao usuário
   */
  verifyEmail(data: VerifyEmailDto): Promise<MessageResponse>

  /**
   * Reenvia código de verificação por SMS
   */
  sendPhoneCode(userId: string): Promise<MessageResponse>

  /**
   * Verifica o código de telefone enviado por SMS
   */
  verifyPhone(data: VerifyPhoneDto): Promise<MessageResponse>

  /**
   * Renova o access token usando o refresh token
   */
  refreshToken(): Promise<AuthResult>

  /**
   * Obtém perfil do usuário autenticado
   */
  getProfile(): Promise<User>

  /**
   * Realiza logout (limpa cookies/tokens)
   */
  logout(): Promise<void>
}
