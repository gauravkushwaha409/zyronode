import { FormWrapper } from "@package/form";
import { Button } from "@package/ui";
import { useLogoutMutation } from "@/features/auth/hooks";
import {
	useCreateOrganizationMutation,
	useOrganizationForm,
} from "../../hooks";
import { OrganizationForm } from "../form";

export function OrganizationMutation({
	onSuccess,
}: { onSuccess?: () => void }) {
	const logoutMutation = useLogoutMutation();
	const organizationForm = useOrganizationForm();
	const createOrganizationMutation = useCreateOrganizationMutation(onSuccess);

	const handleSubmit = organizationForm.form.handleSubmit((data) => {
		createOrganizationMutation.mutate({
			email: data?.email || "",
			industry: data?.industry || "",
			name: data?.name || "",
			phone: data?.phone || "",
			website: data?.website || "",
		});
	});
	return (
		<FormWrapper
			useFormMethods={organizationForm.form}
			formProps={{ className: "space-y-5", onSubmit: handleSubmit }}
		>
			<OrganizationForm />

			<Button type="submit" className="mt-10 w-full">
				Create Organization
			</Button>
			<Button
				onClick={() => logoutMutation.mutate()}
				type="button"
				variant={"destructive"}
				className="mt-10 w-full"
			>
				Logout
			</Button>
		</FormWrapper>
	);
}
