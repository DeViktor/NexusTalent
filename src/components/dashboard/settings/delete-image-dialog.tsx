'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteImageAction } from '@/app/actions';
import type { ImagePlaceholder } from '@/lib/site-data';
import { Loader2 } from 'lucide-react';

interface DeleteImageDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: ImagePlaceholder;
  itemType: 'parceiro' | 'certificação' | 'galeria';
  onDeleteSuccess: () => void;
}

export function DeleteImageDialog({ isOpen, setIsOpen, item, itemType, onDeleteSuccess }: DeleteImageDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteImageAction(item.id);
      if (result.success) {
        toast({ title: 'Sucesso!', description: result.message });
        onDeleteSuccess();
        setIsOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Ocorreu um erro inesperado.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isto irá excluir permanentemente o item de {itemType} <strong className="font-mono">{item.id}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
