import { DialogWrapper } from "@package/ui";
import { OrganizationList, OrganizationMutation } from "@/features/organization/components";

export function SelectOrganizationPage() {
	return (
		<div>
			<OrganizationList />
			<DialogWrapper
				title="Create Organization"
				open={false}
				onOpenChange={() => {}}
			>
				<OrganizationMutation />
			</DialogWrapper>
		</div>
	);
}
