import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  const logInfo = {
    id: requestId,
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  }
  
  console.log(`[REQUEST ${requestId}]`, JSON.stringify(logInfo, null, 2))
  
  const response = NextResponse.next()
  
  const duration = Date.now() - startTime
  response.headers.set('X-Response-Time', `${duration}ms`)
  response.headers.set('X-Request-ID', requestId)
  
  console.log(`[RESPONSE ${requestId}]`, {
    duration: `${duration}ms`,
    status: response.status,
    path: request.nextUrl.pathname,
  })
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 