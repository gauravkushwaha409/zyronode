import type { IconName } from '@package/icons';
import { useEffect, useState } from 'react';
import { Button, buttonVariants } from '#components/base-ui/button';
import type { VariantProps } from 'class-variance-authority';
import { Checkbox } from '#components/base-ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#components/base-ui/dialog';
import { Label } from '#components/base-ui/label';
import { Input } from '../shadcn/input';
import Typography from './typography';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  paragraph?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  checkboxLabel?: string;
  checkboxDefaultChecked?: boolean;
  onConfirm?: (checked: boolean) => void;
  variant: VariantProps<typeof buttonVariants>['variant'];
  confirmText?: string;

  confirmTextLabel?: string;
  isPending?: boolean;
  pendingText?: string;
  rightIcon?: IconName;
}

export function ConfirmationDialog({
  title,
  description,
  paragraph,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  checkboxLabel,
  checkboxDefaultChecked = false,
  onConfirm,
  open,
  onOpenChange,
  variant = 'default',
  confirmText,
  confirmTextLabel,
  isPending,
  pendingText,
  rightIcon,
}: ConfirmationDialogProps) {
  const [checked, setChecked] = useState(checkboxDefaultChecked);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open) {
      setChecked(checkboxDefaultChecked);
      setInputValue('');
    }
  }, [open, checkboxDefaultChecked]);

  const isConfirmTextMode = confirmText !== undefined;
  const isConfirmDisabled = isConfirmTextMode && inputValue !== confirmText;

  const defaultConfirmTextLabel = confirmText ? (
    <>
      Type{' '}
      <span>
        "<strong className="text-alert-500 font-normal">{confirmText}</strong>"
      </span>
      to confirm *
    </>
  ) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-md">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <section className="p-6">
          {typeof paragraph === 'string' ? (
            <Typography.T2 weight="medium" className="text-gray-700">
              {paragraph}
            </Typography.T2>
          ) : (
            paragraph
          )}

          {/* Checkbox variant */}
          {!isConfirmTextMode && checkboxLabel && (
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                id="confirmation-dialog-checkbox"
                checked={checked}
                onCheckedChange={(value) => setChecked(Boolean(value))}
              />
              <Label
                htmlFor="confirmation-dialog-checkbox"
                className="text-gray-950 font-medium typo-t3"
              >
                {checkboxLabel}
              </Label>
            </div>
          )}

          {/* Confirm-text variant */}
          {isConfirmTextMode && (
            <div className="flex flex-col gap-1.5 mt-4">
              <Label
                htmlFor="confirmation-dialog-input"
                className="text-gray-950 font-medium typo-t3"
              >
                {confirmTextLabel ?? defaultConfirmTextLabel}
              </Label>
              <Input
                id="confirmation-dialog-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                placeholder={`Type ${confirmText}`}
                autoComplete="off"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant}
              icon={rightIcon}
              onClick={() => onConfirm?.(checked)}
              disabled={isConfirmDisabled || isPending}
              isPending={isPending ?? false}
              pendingText={pendingText ?? ''}
              showLoading={false}
            >
              {confirmLabel}
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
