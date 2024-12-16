import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/api';

//in memory cache only for development
const sessionCache = new Map<string, boolean>();

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const username = request.cookies.get('username')?.value;
  const path = request.nextUrl.pathname;

  if (token) {
    if (!sessionCache.has(token)) {
      try {
        const data = await getSession(token);
        sessionCache.set(token, !!data);
      } catch {
        sessionCache.set(token, false);
      }
    }

    const isValid = sessionCache.get(token);
    if (!isValid) {
      // Create a new response to modify cookies
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('token', '', { path: '/', expires: new Date(0) });
      response.cookies.set('username', '', { path: '/', expires: new Date(0) });
      console.log('Token deleted');
      return response;
    }
  }

  if (!token && !['/login', '/signup'].includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && ['/login', '/signup'].includes(path)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path === '/home') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path === '/collections') {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  if (username && path === `/p/${username}`) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|sitemap.xml).*)'],
};