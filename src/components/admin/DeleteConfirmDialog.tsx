import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmDialog({ open, onOpenChange, productTitle, onConfirm, isDeleting }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Delete Product</AlertDialogTitle>
          <AlertDialogDescription className="font-body">
            Are you sure you want to delete <strong>{productTitle}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
