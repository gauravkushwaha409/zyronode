import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form'
import { type ReactNode,  } from 'react'

interface FormWrapperProps<T extends FieldValues> {
  children: ReactNode
  useFormMethods: UseFormReturn<T>
  formProps?: React.ComponentProps<'form'>
}

export const FormWrapper = <T extends FieldValues>({
  children,
  useFormMethods,
  formProps   
}: FormWrapperProps<T>) => {
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