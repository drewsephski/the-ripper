import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

//redirects https://exa-hallucination-detector.vercel.app to demo.exa.ai/hallucination-detector
export function middleware(request: NextRequest) {
  if (request.headers.get('host') === 'the-ripper-omega.vercel.app') {
    return NextResponse.redirect('https://the-ripper-omega.vercel.app', {
      status: 301
    })
  }
  return NextResponse.next()
}
export const config = {
  matcher: '/:path*'
} 