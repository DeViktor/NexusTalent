export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  role?: string;
}

export interface SiteData {
  stats?: { students?: number; companies?: number; satisfaction?: string };
  images?: ImagePlaceholder[];
  partners?: { id: string; name: string; logoId: string }[];
  locations?: { id: string; name: string; address: string; phone: string }[];
  certifications?: { id: string; name: string; description: string }[];
  blogPosts?: { id: string; title: string; excerpt: string; date: string; author: string; imageId: string }[];
}

export async function getSiteData(): Promise<SiteData> {
  if (typeof window === 'undefined') {
    try {
      const { getServerSupabase } = await import('./supabase/client');
      const serverSupabase = getServerSupabase();
      const { data, error } = await (serverSupabase as any)
        .from('site_data')
        .select('data')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return ((data as any)?.data || {}) as SiteData;
    } catch (e) {
      console.error('Erro ao carregar dados do site:', e);
      return {};
    }
  }

  const res = await fetch('/api/site-data', { cache: 'no-store' });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar dados do site.');
  return (json.data || {}) as SiteData;
}

export async function getImages(): Promise<ImagePlaceholder[]> {
  const data = await getSiteData();
  return Array.isArray(data.images) ? data.images : [];
}

export async function getImageById(id: string): Promise<ImagePlaceholder | undefined> {
  const images = await getImages();
  return images.find((p) => p.id === id);
}
