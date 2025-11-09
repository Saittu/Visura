export interface User {
  id: string
  email: string
  username: string
  name: string
  telephone: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: Date
}

export interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterDto {
  email: string
  username: string
  password: string
  name: string
  telephone: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface VerifyEmailDto {
  code: string
}

export interface VerifyPhoneDto {
  userId: string
  code: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

// ===== Response Types =====
export interface MessageResponse {
  message: string
}

export interface ErrorResponse {
  message: string
  statusCode: number
  error?: string
}
