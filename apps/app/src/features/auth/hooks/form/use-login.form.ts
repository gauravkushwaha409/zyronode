import { useAppForm } from "@package/react-hook-form"
import { loginSchema, type LoginSchema } from "../../schema"

export function useLoginForm() {
    const form = useAppForm<LoginSchema>({
        defaultValues: {
            email: "",
            password: ""
        },
        schema: loginSchema,
    })


    return { form }
}