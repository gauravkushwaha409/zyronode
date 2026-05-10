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

    const handleSubmit = form.handleSubmit((values) => {
        console.log(values)
    })

    const handleError = form.handleSubmit(() => {
        console.log("error")
    })

    return { form }
}