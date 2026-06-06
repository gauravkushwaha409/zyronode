import { DialogWrapper } from "@package/ui";
import { OrganizationMutation } from "@/features/organization/components";

export function SelectOrganizationPage() {
	return (
		<DialogWrapper open={true} onOpenChange={() => {}}>
			<OrganizationMutation />
		</DialogWrapper>
	);
}
