import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { LoginDto, AuthResult, ErrorResponse } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function POST(request: NextRequest) {
  try {
    const body: LoginDto = await request.json()

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(data, { status: response.status })
    }

    const authResult = data as AuthResult

    // Set httpOnly cookies for tokens
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieStore = await cookies()

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
