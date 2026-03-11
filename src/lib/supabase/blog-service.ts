import { getServerSupabase } from '@/lib/supabase/client';
 
export type BlogPost = {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  authorAvatarUrl?: string | null;
  imageUrl?: string | null;
  excerpt: string;
  contentHtml: string;
};
 
export async function getBlogPosts(): Promise<BlogPost[]> {
  const admin = getServerSupabase();
  const { data, error } = await (admin as any)
    .from('blog_posts')
    .select('id, title, category, date, author, author_avatar_url, image_url, excerpt, content_html')
    .order('date', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: String(r.id),
    title: String(r.title || ''),
    category: String(r.category || ''),
    date: String(r.date || ''),
    author: String(r.author || ''),
    authorAvatarUrl: r.author_avatar_url ?? null,
    imageUrl: r.image_url ?? null,
    excerpt: String(r.excerpt || ''),
    contentHtml: String(r.content_html || ''),
  }));
}
 
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const admin = getServerSupabase();
  const { data, error } = await (admin as any)
    .from('blog_posts')
    .select('id, title, category, date, author, author_avatar_url, image_url, excerpt, content_html')
    .eq('id', id)
    .single();
  if (error) return null;
  return {
    id: String(data.id),
    title: String(data.title || ''),
    category: String(data.category || ''),
    date: String(data.date || ''),
    author: String(data.author || ''),
    authorAvatarUrl: data.author_avatar_url ?? null,
    imageUrl: data.image_url ?? null,
    excerpt: String(data.excerpt || ''),
    contentHtml: String(data.content_html || ''),
  };
}

