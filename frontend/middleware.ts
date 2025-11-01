import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { redirectRoot } from './middlewares/redirect-root'

export function middleware(request: NextRequest) {
  const redirect = redirectRoot(request)
  if (redirect) return redirect

  return NextResponse.next()
}
