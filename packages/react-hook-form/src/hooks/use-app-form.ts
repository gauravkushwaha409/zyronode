import { zodResolver } from '@hookform/resolvers/zod'
import { type FieldValues, type UseFormProps, useForm } from 'react-hook-form'
import type { z } from 'zod'

interface UseAppFormProps<T extends FieldValues> extends UseFormProps<T> {
  schema?: z.ZodType<any, any, any>  // ✅ works with both zod v3 and v4
}

export function useAppForm<T extends FieldValues>({
  schema,
  ...props
}: UseAppFormProps<T>) {
  return useForm<T>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    ...props,
    resolver: schema ? zodResolver(schema) : undefined,
  })
}