import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_EXACT = new Set(['/login', '/robots.txt']);
const PUBLIC_PREFIXES = ['/_next/'];
const STATIC_EXT = /\.(?:png|jpg|jpeg|webp|svg|ico|css|js|woff2?|txt|xml)$/i;

function isPublic(pathname: string, method: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  if (STATIC_EXT.test(pathname)) return true;
  if (pathname === '/api/health') return true;
  if (method === 'POST' && pathname === '/api/auth/login') return true;
  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('stelus_session')?.value;

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!session && !isPublic(pathname, req.method)) {
    if (pathname.startsWith('/api') || pathname.startsWith('/generated')) {
      return NextResponse.json({ error: 'Token não informado' }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
