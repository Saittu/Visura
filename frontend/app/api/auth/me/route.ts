import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { User, ErrorResponse } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'UNAUTHORIZED',
          message: 'No access token found',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    // Backend usa POST para /auth/me (protegido com guard)
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(data, { status: response.status })
    }

    return NextResponse.json<User>(data)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        message: 'Failed to get profile',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}
