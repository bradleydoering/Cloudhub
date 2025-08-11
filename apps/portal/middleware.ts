import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  try {
    // Check if Supabase env vars are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not found, skipping auth middleware')
      return response
    }

    const supabase = createMiddlewareClient({ req: request, res: response })

    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Supabase auth error in middleware:', error)
      return response
    }

    // If no session and not on auth page, redirect to login
    if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If session exists and on auth page, redirect to dashboard
    if (session && request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return response without auth checks if middleware fails
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}