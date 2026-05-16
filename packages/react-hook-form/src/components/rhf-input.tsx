// packages/rhf/src/components/rhf-input.tsx
import { Input, Label } from "@package/ui";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
// Rhf uses register to listen to the input data and store the data object internally and to manage those data we often use useform() hook. useFormContext is used to access shared from internal state.

interface RhfInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function RhfInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  className,
}: RhfInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className={className}
        {...register(name)}
        // register() return the object like name: "name", onChange: function, onBlur: function, ref: function which will automatically track the input field and store the value internally with the fieldname of the input field. Using it with the Input field means attaching all the methods of regsiter to the input. Spread opeartor helps to unpack the returned onject properties.
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
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
