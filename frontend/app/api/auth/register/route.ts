import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { RegisterDto, AuthResult } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function POST(request: Request) {
  try {
    const body: RegisterDto = await request.json()

    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    // Armazenar tokens em cookies httpOnly seguros
    const cookieStore = await cookies()
    cookieStore.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutos
      path: '/'
    })

    cookieStore.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    // Retornar resultado sem os tokens (já estão nos cookies)
    const result: AuthResult = {
      user: {
        id: data.userId || '',
        email: body.email,
        username: body.username,
        name: body.name,
        telephone: body.telephone,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date()
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Erro ao registrar usuário' },
      { status: 500 }
    )
  }
}
