import { GraduationCap } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="h-8 w-8 text-primary" />
      <span className="font-headline text-2xl font-bold text-foreground">
        Nexus<span className="text-primary">Talent</span>
      </span>
    </div>
  );
}
