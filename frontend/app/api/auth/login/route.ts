import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { LoginDto, AuthResult, ErrorResponse, User } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function POST(request: NextRequest) {
  try {
    const body: LoginDto = await request.json()

    // Chama backend /auth/login para obter tokens
    const tokenRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      return NextResponse.json<ErrorResponse>(tokenData, {
        status: tokenRes.status
      })
    }

    // tokenData é TokenResponse (accessToken, refreshToken, opcional userId)
    const accessToken: string = tokenData.accessToken
    const refreshToken: string = tokenData.refreshToken

    // Armazena tokens em cookies httpOnly
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieStore = await cookies()
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/'
    })
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    // Busca perfil para montar AuthResult consistente (user dentro)
    const profileRes = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'POST', // backend define /auth/me como POST protegido pelo guard
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const profileData = await profileRes.json()
    if (!profileRes.ok) {
      // Se falhar perfil, ainda retornamos tokens mas sem user -> erro controlado
      return NextResponse.json<ErrorResponse>(
        {
          error: 'PROFILE_FETCH_FAILED',
          message: profileData?.message || 'Falha ao obter perfil após login',
          statusCode: 500
        },
        { status: 500 }
      )
    }

    const user: User = {
      id: profileData.id,
      email: profileData.email,
      username: profileData.username,
      avatar_url: profileData.avatar_url,
      name: profileData.name,
      telephone: profileData.telephone,
      emailVerified: profileData.email_verified ?? false,
      phoneVerified: profileData.phone_verified ?? false,
      createdAt: new Date(profileData.created_at)
    }

    const authResult: AuthResult = {
      user,
      accessToken,
      refreshToken
    }

    return NextResponse.json<AuthResult>(authResult)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        message: 'Failed to process login',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}
