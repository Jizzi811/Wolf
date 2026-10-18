import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'closer_session';

/**
 * Leichter Schutz der internen Bereiche: ohne Sitzungs-Cookie direkt zum Login.
 * Die eigentliche Prüfung (Signatur, Rolle, Rechte) passiert in den Seiten.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedArea = pathname.startsWith('/admin') || pathname.startsWith('/team') || pathname.startsWith('/mein');
  if (protectedArea && !req.cookies.get(COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/team/:path*', '/mein/:path*'],
};
