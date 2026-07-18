import { FormInput, FormWrapper, useForm } from "@package/form";
import { AuthLayout, Button, toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { CONFIG } from "@/config";
import {
	useLogoutMutation,
	useMeQuery,
	useResendEmailVerificationMutation,
	useVerifyEmailMutation,
} from "@/features/auth/hooks";
import { authApiService } from "@/features/auth/services";
import { queryClient } from "@/lib/query-client";

const verifyEmailSchema = z.object({
	token: z.string().length(6, "Code must be exactly 6 characters"),
});

type VerifyEmailForm = z.infer<typeof verifyEmailSchema>;

function useCountdown(seconds: number) {
	const [timeLeft, setTimeLeft] = useState(seconds);
	const [isRunning, setIsRunning] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const start = useCallback(() => {
		setTimeLeft(seconds);
		setIsRunning(true);
	}, [seconds]);

	const stop = useCallback(() => {
		setIsRunning(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (isRunning && timeLeft > 0) {
			intervalRef.current = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (timeLeft <= 0) {
			stop();
		}
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isRunning, timeLeft, stop]);

	return { start, stop, timeLeft, isRunning };
}

export function VerifyEmailPage() {
	const router = useRouter();
	const { data: meData } = useMeQuery();
	const logoutMutation = useLogoutMutation();
	const verifyEmailMutation = useVerifyEmailMutation();
	const resendEmailVerificationMutation = useResendEmailVerificationMutation();
	const { start, timeLeft, isRunning } = useCountdown(30);

	const email = meData?.data?.data?.email || "your email";
	const progress = ((30 - timeLeft) / 30) * 100;

	const form = useForm<VerifyEmailForm>({
		schema: verifyEmailSchema,
		defaultValues: { token: "" },
	});

	const handleSubmit = form.handleSubmit(
		(data) => {
			verifyEmailMutation.mutate(
				{ email, code: data.token },
				{
					onSuccess: async (response) => {
						toast.success(response?.data?.message || "Email verified successfully");

						await queryClient.fetchQuery({
							queryKey: CONFIG.QUERY_KEY.AUTH.ME,
							queryFn: () => authApiService.me(),
						});

						router.navigate({ to: "/auth/login" });
					},
					onError: (error) => {
						toast.error(error?.response?.data?.error || "Verification failed");
					},
				},
			);
		},
		() => {
			toast.error("Please enter a valid 6-digit code");
		},
	);

	const handleResend = () => {
		if (isRunning) return;
		resendEmailVerificationMutation.mutate(
			{ email },
			{
				onSuccess: (data) => {
					toast.success(data?.data?.message || "Verification email resent");
					start();
				},
				onError: (error) => {
					toast.error(
						error?.response?.data?.error || "Failed to resend verification email",
					);
				},
			},
		);
	};

	return (
		<AuthLayout>
			<FormWrapper useFormMethods={form} formProps={{ onSubmit: handleSubmit }}>
				<section className="w-150 space-y-4 2xl:space-y-6">
					<div className="space-y-1.5">
						<h3 className="text-xl font-semibold text-gray-900">Verify your Email</h3>
						<p className="text-sm text-gray-500 font-medium">
							Enter the 6-digit code sent to{" "}
							<span className="font-medium text-gray-700">{email}</span> to complete
							verification.
						</p>
					</div>

					<div className="space-y-4 2xl:space-y-6">
						<FormInput
							name="token"
							label="Verification Code"
							placeholder="Enter the 6-digit code"
						/>

						<section className="flex gap-3 flex-row items-center">
							<div
								style={{
									width: "24px",
									height: "24px",
									borderRadius: "50%",
									background: `conic-gradient(#7c3aed ${progress}%, #e5e7eb 0%)`,
									position: "relative",
									transition: "background 0.5s linear",
									flexShrink: 0,
								}}
							>
								<div
									style={{
										position: "absolute",
										inset: "3px",
										background: "white",
										borderRadius: "100%",
									}}
								/>
							</div>
							<button
								type="button"
								onClick={handleResend}
								disabled={isRunning}
								className={`typo-1 transition-opacity ${
									!isRunning ? "text-primary-600 cursor-pointer" : "opacity-40"
								}`}
							>
								{isRunning ? `Resend Code in ${timeLeft}s` : "Resend Code"}
							</button>
						</section>

						<Button
							type="submit"
							size="xl"
							className="w-full"
							disabled={verifyEmailMutation.isPending}
						>
							{verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
						</Button>
					</div>

					<button
						type="button"
						onClick={() => logoutMutation.mutate()}
						disabled={logoutMutation.isPending}
						className="typo-t1 text-primary-600 underline w-full text-center cursor-pointer font-normal"
					>
						Logout
					</button>
				</section>
			</FormWrapper>
		</AuthLayout>
	);
}
