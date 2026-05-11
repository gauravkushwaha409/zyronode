import { useAppForm } from "@package/react-hook-form"
import { loginSchema } from "../schema"

export function useLoginForm() {
    const form = useAppForm({
        defaultValues: {
            email: "",
            password: ""
        },
        schema: loginSchema,
    })


    return { form }
}