import { useAppForm } from "@packages/react-hook-form"
import { registerSchema, type RegisterSchema } from "../schema"

export function useRegisterForm() {
    const form = useAppForm<RegisterSchema>({
        defaultValues: {
            email: "",
            password: ""
        },
        schema: registerSchema,
    })

    return { form }
}