import { useAppForm } from "@packages/react-hook-form"
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