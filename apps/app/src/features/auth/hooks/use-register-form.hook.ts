import { useAppForm } from "@package/react-hook-form"
import { registerSchema, type RegisterSchema } from "../schema"

export function useRegisterForm() {
    const form = useAppForm<RegisterSchema>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: ""
        },
        schema: registerSchema,
    })

    return { form , }
}