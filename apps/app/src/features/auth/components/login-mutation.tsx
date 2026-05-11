import { AppFormWrapper } from "@package/react-hook-form";
import { LoginForm } from "./login-form";
import { useLoginForm } from "../hooks";

export function LoginMutation() {
    const loginForm = useLoginForm()

    const handleSubmit = loginForm.form.handleSubmit(
        (data)=>{
            console.log("On valid: ", data)
        },
        (error)=>{console.log("On error: ", error)}
    )

    return (
        <AppFormWrapper useFormMethods={loginForm.form} formProps={{onSubmit: handleSubmit}}>
            <LoginForm />
        </AppFormWrapper>
    )
}