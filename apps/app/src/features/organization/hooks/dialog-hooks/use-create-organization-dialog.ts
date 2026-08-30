import { useDialogOpen } from "@/stores/use-dialog-open.store";

export const useCreateOrganizationDialog = () => {
	return useDialogOpen({
		key: "create-organization-dialog",
	});
};
