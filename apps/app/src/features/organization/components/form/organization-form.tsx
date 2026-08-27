import { FormInput } from "@package/form";

export function OrganizationForm() {
	return (
		<div className="space-y-4">
			<FormInput label="Organization Name" name="name" />
			<FormInput label="Website" name="website" />
			<FormInput label="Email" name="email" />
			<FormInput label="Phone" name="phone" inputProps={{ type: "tel" }} />
			<FormInput label="Industry" name="industry" />
		</div>
	);
}
