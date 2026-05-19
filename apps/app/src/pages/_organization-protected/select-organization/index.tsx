import { OrganizationMutation } from "@/features/organization/components";
import { DialogWrapper } from "@package/ui";

export function SelectOrganizationPage(){
    return(
        <DialogWrapper open={true} onOpenChange={()=>{}}>
            <OrganizationMutation />
        </DialogWrapper>
    )
}