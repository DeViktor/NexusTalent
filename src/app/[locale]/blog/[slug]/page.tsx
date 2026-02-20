import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/blog-posts';
import { type Metadata } from 'next';
import { BlogPostContent } from '@/components/blog/blog-post-content';

// This function runs on the server
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) {
    return {
      title: 'Artigo não encontrado',
      description: 'O artigo que você está procurando não existe.',
    };
  }

  return {
    title: `${post.title} | Blog NexusTalent`,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.id,
  }));
}


export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) {
    notFound();
  }
  
  const relatedPosts = blogPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3);

  return <BlogPostContent post={post} relatedPosts={relatedPosts} />;
}
