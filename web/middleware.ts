import { NextResponse, type NextRequest } from 'next/server';

// Edge gate: everything except /login and Next internals needs the session
// cookie. Page-level requireAuth() re-checks server-side as defense in depth.
const SESSION_COOKIE = 'ab_admin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token && token === process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Guard all app routes; skip static assets and Next internals.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
