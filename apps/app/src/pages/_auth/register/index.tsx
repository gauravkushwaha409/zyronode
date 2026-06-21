import { RegisterMutation } from "@/features/auth/components";

export function RegisterPage() {
	return (
		<div className="relative flex min-h-dvh items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="w-full max-w-md space-y-4">
				<RegisterMutation />
			</div>
		</div>
	);
}
