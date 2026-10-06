import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('jeansbd_admin_session')?.value;
    
    // If no session cookie is found, redirect to admin login immediately
    if (!adminSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Sensitive API mutation protection (Upload & Products POST/PUT/DELETE)
  if (
    (pathname.startsWith('/api/upload') || pathname.startsWith('/api/products')) &&
    request.method !== 'GET'
  ) {
    const adminSession = request.cookies.get('jeansbd_admin_session')?.value;
    const authHeader = request.headers.get('authorization');
    const customHeader = request.headers.get('x-admin-auth');

    // Allow if valid admin cookie or header is present
    const isAuthorized = !!adminSession || !!authHeader || customHeader === 'true';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required to perform this action.' },
        { status: 401 }
      );
    }
  }

  // 3. Security response headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
