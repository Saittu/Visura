export interface TokenPayload {
  sub: string
  email: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  userId?: string // Opcional para retornar no registro
}
