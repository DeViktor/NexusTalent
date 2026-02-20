import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';

const intlMiddleware = createMiddleware({
  locales: ['pt', 'en', 'fr'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed'
});

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isDashboard = /^\/dashboard(\/|$)/.test(pathname) || /^\/[a-z]{2}\/dashboard(\/|$)/.test(pathname);

  if (isDashboard) {
    // Check for app_session cookie first (custom auth)
    const appSession = req.cookies.get('app_session')?.value;
    if (appSession) {
      // If we have a session, we can proceed. 
      // Important: next-intl middleware must still run for localized dashboard routes
      return NextResponse.next();
    }

    // Fallback to Supabase Auth check
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
      const currentLocale = localeMatch ? localeMatch[1] : 'pt';
      const loginUrl = new URL(`/${currentLocale}/login`, req.url);
      const redirectTarget = pathname + (req.nextUrl.search || '');
      loginUrl.searchParams.set('redirectTo', redirectTarget);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run i18n middleware for all other routes
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
