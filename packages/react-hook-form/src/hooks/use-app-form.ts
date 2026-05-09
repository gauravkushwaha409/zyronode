import { type FieldValues, type UseFormProps, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType, ZodTypeDef } from 'zod'

interface UseAppFormProps<T extends FieldValues> extends UseFormProps<T> {
  schema?: ZodType<T, ZodTypeDef, unknown>
}

export function useAppForm<T extends FieldValues>({
  schema,
  ...props
}: UseAppFormProps<T>) {
  return useForm<T>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    ...props,
    resolver: schema ? zodResolver(schema) : props.resolver,
  })
}