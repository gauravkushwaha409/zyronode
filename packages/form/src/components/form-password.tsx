import { cn } from "@package/ui";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";

interface FormPasswordProps<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	placeholder?: string;
	inputProps?: Omit<React.ComponentProps<"input">, "name" | "placeholder">;
	labelProps?: Omit<React.ComponentProps<"label">, "children" | "htmlFor">;
	wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function FormPassword<T extends FieldValues>({
	name,
	label,
	placeholder,
	inputProps,
	labelProps,
	wrapperProps,
}: FormPasswordProps<T>) {
	const {
		register,
		formState: { errors },
	} = useFormContext<T>();
	const error = errors[name]?.message as string | undefined;
	const { className: inputClassName, ...restInputProps } = inputProps || {};
	const { className: labelClassName, ...restLabelProps } = labelProps || {};
	const { className: wrapperClassName, ...restWrapperProps } =
		wrapperProps || {};

	return (
		<div className={cn("space-y-3", wrapperClassName)} {...restWrapperProps}>
			{label && (
				<label
					className={cn("block text-sm font-medium text-gray-700", labelClassName)}
					htmlFor={name}
					{...restLabelProps}
				>
					{label}
				</label>
			)}
			<input
				id={name}
				type="password"
				placeholder={placeholder}
				className={cn(
					"flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
					error && "border-red-500 focus:ring-red-500 focus:border-red-500",
					inputClassName,
				)}
				aria-invalid={!!error}
				aria-describedby={error ? `${name}-error` : undefined}
				{...register(name)}
				{...restInputProps}
			/>
			{error && (
				<p id={`${name}-error`} role="alert" className="text-red-500 text-sm">
					{error}
				</p>
			)}
		</div>
	);
}
