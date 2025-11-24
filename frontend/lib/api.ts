import type {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  VerifyPhoneDto,
  AuthResult,
  MessageResponse,
  User
} from '@visura/shared'

// Base do backend Rails/Prisma hospedado (Railway). Em produção, definir NEXT_PUBLIC_BACKEND_URL na Vercel.
// Fallback para desenvolvimento local.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3332'
// Endpoint base das rotas de auth no backend NestJS
const API_URL = `${BACKEND_URL}/auth`

// Re-exportar tipos do shared para compatibilidade com código existente
export type RegisterPayload = RegisterDto
export type RegisterResponse = AuthResult
export type LoginPayload = LoginDto

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = isJson
      ? body?.message || body?.error || 'Erro na requisição'
      : body || 'Erro na requisição'
    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }

  return body as T
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<RegisterResponse>(res)
}

export type VerifyEmailPayload = VerifyEmailDto

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<MessageResponse> {
  const res = await fetch(`${API_URL}/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<MessageResponse>(res)
}

export async function sendPhoneCode(userId: string): Promise<MessageResponse> {
  const res = await fetch(`${API_URL}/send-phone-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  })

  return handleResponse<MessageResponse>(res)
}

export type VerifyPhonePayload = VerifyPhoneDto

export async function verifyPhone(
  payload: VerifyPhonePayload
): Promise<MessageResponse> {
  const res = await fetch(`${API_URL}/verify-phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<MessageResponse>(res)
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<AuthResult>(res)
}

export async function logout(): Promise<MessageResponse> {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return handleResponse<MessageResponse>(res)
}

export async function getProfile(): Promise<User> {
  const res = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return handleResponse<User>(res)
}

export async function refreshToken(): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return handleResponse<AuthResult>(res)
}
