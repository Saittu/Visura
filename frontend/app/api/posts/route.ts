import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { CreatePostDto, Post, PaginatedPosts } from '@visura/shared'

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3333'

export async function POST(request: Request) {
  try {
    const body: CreatePostDto = await request.json()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }

    const res = await fetch(`${BACKEND_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    const result: Post = data
    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Erro ao criar post' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = url.searchParams.get('limit')
    const authorId = url.searchParams.get('authorId')

    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }

    const qs = new URLSearchParams()
    if (cursor) qs.set('cursor', cursor)
    if (limit) qs.set('limit', limit)
    if (authorId) qs.set('authorId', authorId)

    const res = await fetch(`${BACKEND_URL}/posts?${qs.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: 'no-store'
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    const result: PaginatedPosts = data as PaginatedPosts
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Erro ao listar posts' },
      { status: 500 }
    )
  }
}
