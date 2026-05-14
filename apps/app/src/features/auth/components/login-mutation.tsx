import { AppFormWrapper } from "@package/react-hook-form";
import { LoginForm } from "./login-form";
import { useLoginForm, useLoginMutation } from "../hooks";

export function LoginMutation() {
    const loginForm = useLoginForm()
    const loginMutation = useLoginMutation()

    const handleSubmit = loginForm.form.handleSubmit(
        (data)=>{
            loginMutation.mutate(data)
        },
        (error)=>{console.log("On error: ", error)}
    )

    return (
        <AppFormWrapper useFormMethods={loginForm.form} formProps={{onSubmit: handleSubmit}}>
            <LoginForm />
        </AppFormWrapper>
    )
}