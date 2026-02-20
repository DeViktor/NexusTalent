'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { ImageFormDialog } from './image-form-dialog';
import { DeleteImageDialog } from './delete-image-dialog';
import type { ImagePlaceholder } from '@/lib/site-data';

interface EditableImageGridProps {
  items: ImagePlaceholder[];
  itemType: 'parceiro' | 'certificação' | 'galeria';
  idPrefix: 'partner-' | 'cert-' | 'gallery-';
  onUpdate: (updatedItems: ImagePlaceholder[]) => void;
}

export function EditableImageGrid({ items, itemType, idPrefix, onUpdate }: EditableImageGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ImagePlaceholder | null>(null);

  const handleOpenDialog = (item: ImagePlaceholder | null = null) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: ImagePlaceholder) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <Card key={item.id} className="flex flex-col group">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <p className="text-sm font-mono text-muted-foreground truncate">{item.id}</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center flex-grow p-4 pt-0">
              <div className="relative w-32 h-20 mb-4 rounded-md overflow-hidden bg-secondary">
                <Image src={item.imageUrl} alt={item.description} fill className="object-contain" />
              </div>
              <p className="text-xs text-muted-foreground mb-2 h-8 line-clamp-2">{item.description}</p>
              <div className="w-full space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenDialog(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => handleOpenDeleteDialog(item)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          variant="outline"
          className="flex flex-col items-center justify-center h-full min-h-[220px] border-dashed"
          onClick={() => handleOpenDialog(null)}
        >
          <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-muted-foreground">Adicionar {itemType}</span>
        </Button>
      </div>

      <ImageFormDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        item={selectedItem}
        itemType={itemType}
        idPrefix={idPrefix}
        allItems={items}
        onUpdate={onUpdate}
      />

      {selectedItem && (
         <DeleteImageDialog
            isOpen={deleteDialogOpen}
            setIsOpen={setDeleteDialogOpen}
            item={selectedItem}
            itemType={itemType}
            onDeleteSuccess={() => onUpdate(items.filter(i => i.id !== selectedItem.id))}
        />
      )}
    </div>
  );
}
