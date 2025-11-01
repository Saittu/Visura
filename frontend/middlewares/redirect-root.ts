import { NextResponse, type NextRequest } from 'next/server'

export function redirectRoot(req: NextRequest) {
  const url = req.nextUrl.clone()

  if (url.pathname === '/') {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return null // nada a fazer
}
