import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { VerifyEmailDto, MessageResponse } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function POST(request: Request) {
  try {
    const body: VerifyEmailDto = await request.json()

    const res = await fetch(`${BACKEND_URL}/auth/verify-email`, {
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

    const result: MessageResponse = {
      message: data.message || 'Email verificado com sucesso'
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Erro ao verificar email' },
      { status: 500 }
    )
  }
}
