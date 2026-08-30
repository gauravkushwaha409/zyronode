import { FormInput, FormWrapper } from "@package/form";
import { Button, DialogWrapper, toast } from "@package/ui";
import { useRouter } from "@tanstack/react-router";
import { useCreateOrganizationDialog } from "../hooks/dialog-hooks";
import { useCreateOrganizationDialogForm } from "../hooks/form-handler";
import {
	useCreateOrganizationMutation,
	useSwitchOrganizationMutation,
} from "../hooks/mutation";

export function CreateOrganizationDialog() {
	const { close, isOpen } = useCreateOrganizationDialog();
	const form = useCreateOrganizationDialogForm();
	const router = useRouter();

	const createOrganization = useCreateOrganizationMutation();
	const switchOrganization = useSwitchOrganizationMutation();

	const handleSubmit = form.handleSubmit((payload) => {
		createOrganization.mutate(
			{
				name: payload.name ?? "",
				website: payload.website ?? "",
			},
			{
				onSuccess: (response) => {
					const organizationId = response?.data?.data?.id;
					if (!organizationId) return;

					switchOrganization.mutate(organizationId, {
						onSuccess: () => {
							close();
							form.reset();
							router.navigate({
								to: "/$organization/dashboard",
								params: { organization: organizationId },
							});
						},
						onError: (error) => {
							toast.error(
								error?.response?.data?.error ??
									"Organization created, but switching into it failed. Please switch manually.",
							);
							close();
							form.reset();
						},
					});
				},
				onError: (error) => {
					toast.error(
						error?.response?.data?.error ?? "Failed to create organization",
					);
				},
			},
		);
	});

	const isPending = createOrganization.isPending || switchOrganization.isPending;

	return (
		<DialogWrapper
			onOpenChange={close}
			open={isOpen}
			title="Create New Organization"
			size="lg"
			footer={
				<div className="grid grid-cols-2 gap-4">
					<Button size="lg" variant="secondary" onClick={close}>
						Cancel
					</Button>
					<Button
						size="lg"
						disabled={isPending}
						isPending={isPending}
						onClick={() => handleSubmit()}
					>
						Create
					</Button>
				</div>
			}
		>
			<FormWrapper
				useFormMethods={form}
				formProps={{
					onSubmit: handleSubmit,
					className: "p-6 flex flex-col gap-5",
				}}
			>
				<FormInput
					required
					name="name"
					label="Organization Name"
					placeholder="e.g. Acme Inc"
				/>
				<FormInput
					name="website"
					label="Website"
					placeholder="e.g. https://acme.com"
				/>
			</FormWrapper>
		</DialogWrapper>
	);
}
