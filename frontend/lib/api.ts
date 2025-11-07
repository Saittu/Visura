export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export type RegisterPayload = {
  email: string
  username: string
  password: string
  name: string
  telephone: string
}

export type RegisterResponse = {
  accessToken: string
  refreshToken: string
  userId?: string
}

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
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<RegisterResponse>(res)
}

export type VerifyEmailPayload = {
  code: string
}

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<{ message: string }>(res)
}

export async function sendPhoneCode(
  userId: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/send-phone-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  })

  return handleResponse<{ message: string }>(res)
}

export type VerifyPhonePayload = {
  userId: string
  code: string
}

export async function verifyPhone(
  payload: VerifyPhonePayload
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/verify-phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<{ message: string }>(res)
}
