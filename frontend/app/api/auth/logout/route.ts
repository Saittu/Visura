import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { MessageResponse } from '@visura/shared'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Clear auth cookies
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')

    return NextResponse.json<MessageResponse>({
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json<MessageResponse>(
      { message: 'Failed to logout' },
      { status: 500 }
    )
  }
}
