'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface FilterOption {
  name: string;
  count: number;
}

interface SearchFilterProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SearchFilter({ title, options, selected, onChange }: SearchFilterProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll ? options : options.slice(0, 5);

  const handleCheckedChange = (checked: boolean, name: string) => {
    const newSelected = checked
      ? [...selected, name]
      : selected.filter((item) => item !== name);
    onChange(newSelected);
  };

  return (
    <div className="space-y-2 border-b pb-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="space-y-2">
            {visibleOptions.map(option => (
            <div key={option.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${title}-${option.name}`}
                        checked={selected.includes(option.name)}
                        onCheckedChange={(checked) => handleCheckedChange(Boolean(checked), option.name)}
                    />
                    <Label htmlFor={`${title}-${option.name}`} className="font-normal cursor-pointer">
                        {option.name}
                    </Label>
                </div>
                <span className="text-xs text-muted-foreground">{option.count}</span>
            </div>
            ))}
        </div>
        {options.length > 5 && (
            <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:underline mt-2"
            >
            {showAll ? 'Mostrar menos' : `Mostrar mais (${options.length - 5})`}
            </button>
        )}
    </div>
  );
}
