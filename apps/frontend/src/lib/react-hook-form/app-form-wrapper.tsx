import {
  type FieldValues,
  FormProvider,
  type UseFormReturn,
} from 'react-hook-form';

interface AppFormProps<T extends FieldValues> {
  children: React.ReactNode;
  useFormMethods: UseFormReturn<T>;
  className?: string;
  id?: string;
  isPending?: boolean;
  formError?: string | null;
  ariaLabel?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLFormElement>;
}

export const AppFormWrapper = <T extends FieldValues>({
  children,
  useFormMethods,
  className,
  isPending,
  formError,
  ariaLabel,
  id,
  onSubmit,
  onKeyDown,
}: AppFormProps<T>) => {
  const isDisabled = useFormMethods.formState.isSubmitting || isPending;

  return (
    <FormProvider {...useFormMethods}>
      <form
        id={id}
        noValidate
        aria-label={ariaLabel}
        aria-busy={isPending}
        className={className}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
      >
        {formError && (
          <p role="alert" aria-live="polite" className="form-error">
            {formError}
          </p>
        )}
        <fieldset disabled={isDisabled} className="contents">
          {children}
        </fieldset>
      </form>
    </FormProvider>
  );
};