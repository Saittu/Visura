import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { AuthResult, ErrorResponse, User } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'UNAUTHORIZED',
          message: 'No refresh token found',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    // 1. Chama backend para renovar tokens
    const tokenRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      // Se refresh falhar, limpa cookies
      cookieStore.delete('accessToken')
      cookieStore.delete('refreshToken')
      return NextResponse.json<ErrorResponse>(tokenData, {
        status: tokenRes.status
      })
    }

    // tokenData é TokenResponse (accessToken, refreshToken)
    const newAccessToken: string = tokenData.accessToken
    const newRefreshToken: string = tokenData.refreshToken

    // 2. Atualiza cookies com novos tokens
    const isProduction = process.env.NODE_ENV === 'production'
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/'
    })
    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    // 3. Busca perfil para montar AuthResult consistente
    const profileRes = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newAccessToken}`,
        'Content-Type': 'application/json'
      }
    })
    const profileData = await profileRes.json()

    if (!profileRes.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'PROFILE_FETCH_FAILED',
          message: profileData?.message || 'Falha ao obter perfil após refresh',
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
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }

    return NextResponse.json<AuthResult>(authResult)
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        message: 'Failed to refresh token',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}
