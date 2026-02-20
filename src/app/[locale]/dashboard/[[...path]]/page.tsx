import { redirect } from 'next/navigation';

export default async function LocalizedDashboardRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; path?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const rest = Array.isArray(resolvedParams.path) && resolvedParams.path.length > 0 ? `/${resolvedParams.path.join('/')}` : '';

  // Use the locale from params to build the correct redirect path
  const locale = resolvedParams.locale;

  const qs = resolvedSearchParams
    ? new URLSearchParams(
        Object.entries(resolvedSearchParams).flatMap(([k, v]) => {
      if (typeof v === 'string') return [[k, v]];
      if (Array.isArray(v)) return v.map(val => [k, val]);
      return [];
        })
      ).toString()
    : '';

  redirect(`/${locale}/dashboard${rest}${qs ? `?${qs}` : ''}`);
}
