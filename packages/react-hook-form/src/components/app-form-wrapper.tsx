// packages/rhf/src/components/app-form-wrapper.tsx
import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form'
import { type ReactNode,  } from 'react'

interface AppFormWrapperProps<T extends FieldValues> {
  children: ReactNode
  useFormMethods: UseFormReturn<T>
  formProps?: React.ComponentProps<'form'>
}

export const AppFormWrapper = <T extends FieldValues>({
  children,
  useFormMethods,
  formProps
}: AppFormWrapperProps<T>) => {
  const isDisabled = useFormMethods.formState.isSubmitting
  const {onSubmit, ...restFormProps} = formProps ?? {}

  return (
    <FormProvider {...useFormMethods}>
      <form
        onSubmit={onSubmit} // the actual submit handler
        {...restFormProps}
      >
        <fieldset disabled={isDisabled} className="contents">
          {children}
        </fieldset>
      </form>
    </FormProvider>
  )
}