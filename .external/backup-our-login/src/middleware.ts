import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';
import { verifySession } from '@/lib/auth/session';

const intlMiddleware = createMiddleware({
  locales: ['pt', 'en', 'fr'],
  defaultLocale: 'pt'
});

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isDashboard = /^\/dashboard(\/|$)/.test(pathname) || /^\/[a-z]{2}\/dashboard(\/|$)/.test(pathname);

  // Run i18n middleware for non-dashboard paths
  const res = isDashboard ? NextResponse.next() : intlMiddleware(req);

  if (!isDashboard) return res;

  // Primeiro, verificar cookie de sessão própria
  const cookie = req.cookies.get('app_session')?.value;
  const valid = cookie ? await verifySession(cookie) : null;
  if (valid) {
    return res;
  }

  // Fallback: verificar sessão do Supabase (caso coexistam)
  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const currentLocale = localeMatch ? localeMatch[1] : 'pt';
    const loginUrl = new URL(`/${currentLocale}/login`, req.url);
    const redirectTarget = pathname + (req.nextUrl.search || '');
    loginUrl.searchParams.set('redirectTo', redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
