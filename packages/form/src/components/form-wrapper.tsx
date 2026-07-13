import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form'
import { type ReactNode } from 'react'

interface FormWrapperProps<T extends FieldValues> {
  children: ReactNode
  useFormMethods: UseFormReturn<T>
  className?: string
  formProps?: React.ComponentProps<'form'>
}

export const FormWrapper = <T extends FieldValues>({
  children,
  useFormMethods,
  className,
  formProps
}: FormWrapperProps<T>) => {
  const isDisabled = useFormMethods.formState.isSubmitting
  const {onSubmit, ...restFormProps} = formProps ?? {}

  return (
    <FormProvider {...useFormMethods}>
      <form
        className={className}
        onSubmit={onSubmit}
        {...restFormProps}
      >
          {children}
      </form>
    </FormProvider>
  )
}