import { Button } from '@package/ui';

type ResolveUnresolveDialogProps = {
  dialogContentProps?: { className?: string };
};

export function ResolveUnresolveDialog({ dialogContentProps }: ResolveUnresolveDialogProps) {
  return (
    <Button
      variant="alert-shade"
      leftIcon="unresolved"
      size="xs"
      className={`w-fit ${dialogContentProps?.className}`}
    >
      Unresolve
    </Button>
  );
}
