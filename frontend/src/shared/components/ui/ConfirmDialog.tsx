import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export const ConfirmDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'default',
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-[#161616] border-[#EDEDED] dark:border-white/10 max-w-md shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-light text-[#111111] dark:text-white tracking-tight">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-[#2B2B2B]/60 dark:text-white/60 font-light">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-[11px] uppercase tracking-[0.2em] font-semibold border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`text-[11px] uppercase tracking-[0.2em] font-semibold transition-all ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-900/50 dark:hover:bg-red-900/80 dark:text-red-200 dark:border dark:border-red-500/20'
                : 'bg-[#111111] dark:bg-white hover:bg-[#2B2B2B] dark:hover:bg-[#E5E5E5] text-white dark:text-[#111111]'
            }`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
