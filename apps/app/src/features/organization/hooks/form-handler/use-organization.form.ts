import { useForm } from "@package/react-hook-form";

export function useOrganizationForm() {
    const form = useForm({
        defaultValues: {}
    })

    return { form }
}