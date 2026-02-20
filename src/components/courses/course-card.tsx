import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { getCourseCategories } from '@/lib/course-service';
import { getImages } from '@/lib/site-data';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist.tsx';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const courseCategories = getCourseCategories();
  const category = courseCategories.find(c => c.id === course.category);
  const images = getImages();
  const image = images.find(p => p.id === course.imageId);
  const imageSrc = course.imageDataUri || image?.imageUrl;

  const { wishlist, toggleWishlist } = useWishlist();
  const isInWishlist = wishlist.includes(course.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(course.id);
  }

  return (
    <Link href={`/courses/${course.id}`} className="group relative">
       <Button 
            variant="secondary" 
            size="icon" 
            className="absolute top-3 right-3 z-10 rounded-full h-8 w-8"
            onClick={handleWishlistClick}
        >
            <Heart className={cn("h-4 w-4", isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
        </Button>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
        <div className="relative w-full h-40">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={image?.description || course.name}
              fill
              className="object-cover"
              data-ai-hint={image?.imageHint}
            />
          ) : (
            <div className="w-full h-full bg-secondary"></div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          {category && (
            <Badge variant="secondary" className="mb-2 self-start">{category.name}</Badge>
          )}
          <h3 className="font-headline font-semibold text-lg flex-grow">{course.name}</h3>
          <div className="flex justify-between items-center mt-4">
             <p className="text-sm text-muted-foreground font-mono">{course.id}</p>
             <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-semibold">Ver mais</span>
                <ArrowRight className="h-4 w-4 ml-1" />
             </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
