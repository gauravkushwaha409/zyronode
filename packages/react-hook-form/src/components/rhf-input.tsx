// packages/rhf/src/components/rhf-input.tsx
import { cn, Input, Label } from "@package/ui";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
// Rhf uses register to listen to the input data and store the data object internally and to manage those data we often use useform() hook. useFormContext is used to access shared from internal state.

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  inputProps?: Omit<React.ComponentProps<typeof Input>, "name" | "placeholder">;
  labelProps?: Omit<React.ComponentProps<typeof Label>, "children" | "htmlFor">;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  inputProps,
  labelProps,
  wrapperProps,
}: FormInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;
  const { className: inputClassName, ...restInputProps } = inputProps || {};
  const { className: labelClassName, ...restLabelProps } = labelProps || {};
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps || {};
  return (
    <div className={cn("space-y-3", wrapperClassName)} {...restWrapperProps}>
      {label && <Label className={cn("", labelClassName)} htmlFor={name} {...restLabelProps}>
        {label}
      </Label>}
      <Input
        id={name}
        placeholder={placeholder}
        className={cn("", inputClassName)}
        {...register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...restInputProps}
      />
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
