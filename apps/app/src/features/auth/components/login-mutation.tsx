import { AppFormWrapper } from "@package/react-hook-form";
import { LoginForm } from "./login-form";
import { useLoginForm, useLoginMutation } from "../hooks";
import { useRouter } from "@tanstack/react-router";

export function LoginMutation() {
    const router = useRouter()
    const loginForm = useLoginForm()
    const loginMutation = useLoginMutation()

    const handleSubmit = loginForm.form.handleSubmit(
        (data) => {
            loginMutation.mutate(data, {
                onSuccess: (data) => {
                    router.navigate({ from: '/login', to: '/$organization/dashboard', params: { organization: 'my-org' } })
                    console.log("On success: ", data)
                },
                onError: (error) => {
                    console.log("On error: ", error)
                }
            })
        },
        (error) => { console.log("On error: ", error) }
    )

    return (
        <AppFormWrapper useFormMethods={loginForm.form} formProps={{ onSubmit: handleSubmit }}>
            <LoginForm handleTurnstileSuccess={loginForm.handleTurnstileSuccess} />
        </AppFormWrapper>
    )
}