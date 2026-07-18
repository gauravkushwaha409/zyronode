import { Button, Typography } from "@package/ui";
import { useSuccessOnboarding } from "../hooks";

export function OnboardingSuccess() {
	const { handleStart } = useSuccessOnboarding();

	return (
		<div className="h-screen grid grid-rows-2">
			<div className="bg-linear-to-b from-primary-100 to-white flex items-center justify-center">
				<div className="flex flex-col gap-5">
					<Typography.H3 className="font-medium text-primary-600">
						Manage customers from all channels
					</Typography.H3>
				</div>
			</div>

			<div className="bg-white flex items-center justify-center gap-y-3">
				<div className="max-w-screen-3xl mx-auto flex flex-col items-center justify-center">
					<Typography.D1 className="text-gray-950 font-semibold">
						Welcome to ChatApp!
					</Typography.D1>
					<Typography.H6 className="text-gray-500 font-normal text-center">
						ChatApp helps businesses engage visitors, automate
						conversations, and manage customer messages in one
						inbox.
					</Typography.H6>
					<Button className="mt-9" onClick={handleStart}>
						Start
					</Button>
				</div>
			</div>
		</div>
	);
}
