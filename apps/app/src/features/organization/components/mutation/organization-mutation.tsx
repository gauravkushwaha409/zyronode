import { FormWrapper } from "@package/react-hook-form";
import { OrganizationForm } from "../form";
import { useCreateOrganizationMutation, useOrganizationForm } from "../../hooks";
import { Button } from "@package/ui";

export function OrganizationMutation() {
    const organizationForm = useOrganizationForm()
    const createOrganizationMutation = useCreateOrganizationMutation()
    const handleSubmit = organizationForm.form.handleSubmit((data)=>{
        createOrganizationMutation.mutate({
            email: data?.email || "",
            industry: data?.industry || "",
            name: data?.name || "",
            phone: data?.phone || "",
            website: data?.website || ""
        })
    })
    return (
        <FormWrapper useFormMethods={organizationForm.form} formProps={{ className: "space-y-5", onSubmit: handleSubmit }}>
            <OrganizationForm />

            <Button type="submit" className="mt-10 w-full">Create Organization</Button>
        </FormWrapper>
    )
}