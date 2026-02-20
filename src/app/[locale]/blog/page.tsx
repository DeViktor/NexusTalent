import { blogPosts } from '@/lib/blog-posts';
import { getImages } from '@/lib/site-data';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BlogPostCard } from '@/components/blog/blog-post-card';

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = blogPosts;
  const images = getImages();
  const featuredImage = images.find(p => p.id === featuredPost.imageId);

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold">Blog da NexusTalent</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Insights, dicas e tendências sobre carreira, liderança e desenvolvimento profissional.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && featuredImage && (
            <section className="mb-16">
              <Card className="grid lg:grid-cols-2 overflow-hidden border-2 border-primary/20 shadow-xl">
                <div className="relative w-full h-64 lg:h-auto">
                  <Image
                    src={featuredImage.imageUrl}
                    alt={featuredImage.description}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="self-start mb-2">{featuredPost.category}</Badge>
                  <h2 className="font-headline text-3xl font-bold mb-4">
                    <Link href={`/blog/${featuredPost.id}`} className="hover:text-primary transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                  <Button asChild className="self-start">
                    <Link href={`/blog/${featuredPost.id}`}>
                      Ler Artigo Completo <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </section>
          )}

          {/* Other Posts */}
          <section>
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">Últimos Artigos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Helper Card component for the featured post
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={`bg-card text-card-foreground rounded-xl ${className}`}
      {...props}
    />
  );