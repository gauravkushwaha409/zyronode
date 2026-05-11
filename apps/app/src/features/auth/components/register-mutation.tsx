import { AppFormWrapper } from "@package/react-hook-form";
import { RegisterForm } from "./register-form";
import { useRegisterForm } from "../hooks";

export function RegisterMutation() {
    const registerForm = useRegisterForm()
    const handleSubmit = registerForm.form.handleSubmit((data) => {
        console.log("on valid ", data)
    }, (error) => {
        console.log("on error ", error)
    })
    return (
        <AppFormWrapper useFormMethods={registerForm.form} formProps={{onSubmit: handleSubmit}}>
            <RegisterForm />
        </AppFormWrapper>
    )
}