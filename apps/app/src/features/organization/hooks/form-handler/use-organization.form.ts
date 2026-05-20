import { useForm } from "@package/react-hook-form";
import type { CreateOrganizationSchema } from "../../schema";

export function useOrganizationForm() {
    const form = useForm<CreateOrganizationSchema>({
        defaultValues: {
            email: '',
            industry: '',
            name: '',
            phone: '',
            website: ''
        }
    })

    return { form }
}