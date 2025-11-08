import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { AuthResult, ErrorResponse } from '@visura/shared'

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

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    const data = await response.json()

    if (!response.ok) {
      // If refresh fails, clear cookies
      cookieStore.delete('accessToken')
      cookieStore.delete('refreshToken')

      return NextResponse.json<ErrorResponse>(data, { status: response.status })
    }

    const authResult = data as AuthResult

    // Update cookies with new tokens
    const isProduction = process.env.NODE_ENV === 'production'

    cookieStore.set('accessToken', authResult.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/'
    })

    cookieStore.set('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

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
