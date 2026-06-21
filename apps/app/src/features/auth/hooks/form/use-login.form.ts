import { useForm } from "@package/form"
import { loginSchema, type LoginSchema } from "../../schema"

export function useLoginForm() {
    const form = useForm<LoginSchema>({
        defaultValues: {
            email: "",
            password: "",
            checkbox: true,
            captcha_token: '',
        },
        schema: loginSchema,
    })

    const setTurnstileToken = (token: string) => {
        form.setValue("captcha_token", token, { shouldValidate: true })
    }

    const removeTurnstileToken = () => {
        form.setValue("captcha_token", "", { shouldValidate: true })
    }

    return { form, setTurnstileToken, removeTurnstileToken }
}
