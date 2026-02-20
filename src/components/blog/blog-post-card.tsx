
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/blog-posts';
import { Card, CardContent } from '@/components/ui/card';
import { getImages } from '@/lib/site-data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const images = getImages();
  const image = images.find(p => p.id === post.imageId);
  const authorAvatar = images.find(p => p.id === post.authorAvatarId);

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  const formattedDate = format(parseISO(post.date), "d 'de' MMMM 'de' yyyy", { locale: pt });

  return (
    <Link href={`/blog/${post.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
        {image && (
            <div className="relative w-full h-48">
                <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                />
            </div>
        )}
        <CardContent className="p-6 flex flex-col flex-grow">
            <Badge variant="default" className="mb-3 self-start bg-primary/10 text-primary border-0">{post.category}</Badge>
            <h3 className="font-headline font-semibold text-xl flex-grow mb-4">{post.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 mt-auto border-t pt-4">
                {authorAvatar && (
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={authorAvatar.imageUrl} />
                        <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                    </Avatar>
                )}
                <div>
                    <p className="font-semibold text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar size={12}/> {formattedDate}</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
