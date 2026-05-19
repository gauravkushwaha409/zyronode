import { FormWrapper    } from "@package/react-hook-form";
import { OrganizationForm } from "../form";
import { useOrganizationForm } from "../../hooks";

export function OrganizationMutation(){
    const organizationForm = useOrganizationForm()
    return(
        <FormWrapper useFormMethods={organizationForm.form} formProps={{className: "space-y-5"}}>
            <OrganizationForm />
        </FormWrapper>
    )
}