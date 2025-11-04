export interface TokenPayload {
  sub: string
  email: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}
