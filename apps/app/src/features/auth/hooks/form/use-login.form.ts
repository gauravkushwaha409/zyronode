import { useAppForm } from "@package/react-hook-form"
import { loginSchema, type LoginSchema } from "../../schema"

export function useLoginForm() {
    const form = useAppForm<LoginSchema>({
        defaultValues: {
            email: "",
            password: "",
            turnstile: ''
        },
        schema: loginSchema,
    })

    const handleTurnstileSuccess = (token: string) => {
        form.setValue("turnstile", token, { shouldDirty: true })
    };

    return { form, handleTurnstileSuccess }
}