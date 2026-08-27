import { Button, Icon, Typography } from "@package/ui";

interface SidebarPlanCardProps {
	open: boolean;
	plan?: string;
}

/**
 * Static plan/upsell card. No billing feature exists yet, so "Upgrade Now"
 * is inert for now — wire it to the real billing route once that lands.
 */
export function SidebarPlanCard({ open, plan }: SidebarPlanCardProps) {
	if (!open) return null;

	return (
		<section className="px-3">
			<div className="flex flex-col gap-3 rounded-[10px] border border-primary-100 bg-primary-50 p-3">
				<div className="flex items-center gap-2">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white-base shadow-sm">
						<Icon name="plan" size={16} className="text-primary-500" />
					</span>
					<div className="flex flex-col">
						<Typography.T5 className="text-gray-500">Current Plan:</Typography.T5>
						<Typography.T3 weight="medium" className="text-gray-950 capitalize">
							{plan ?? "Trial"}
						</Typography.T3>
					</div>
				</div>
				<Typography.T5 className="text-gray-500">
					Upgrade to Pro to access all premium features.
				</Typography.T5>
				<Button
					variant="secondary"
					size="sm"
					leftIcon="upgrade"
					className="bg-white-base"
				>
					Upgrade Now
				</Button>
			</div>
		</section>
	);
}
