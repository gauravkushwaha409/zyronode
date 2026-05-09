// packages/rhf/src/components/rhf-input.tsx
import { Input, Label } from '@package/ui'
import { useFormContext, type FieldValues, type Path } from 'react-hook-form'

interface RhfInputProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  type?: string
  className?: string
}

export function RhfInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  className,
}: RhfInputProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className={className}
        {...register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}