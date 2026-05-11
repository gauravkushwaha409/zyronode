import { AppFormWrapper } from "@package/react-hook-form";
import { RegisterForm } from "./register-form";
import { useRegisterForm, useRegisterMutation } from "../hooks";

export function RegisterMutation() {
    const registerForm = useRegisterForm()
    const registerMutation = useRegisterMutation()

    const handleSubmit = registerForm.form.handleSubmit((data) => {
        registerMutation.mutate(data)
    }, (error) => {
        console.log("on error ", error)
    })
    return (
        <AppFormWrapper useFormMethods={registerForm.form} formProps={{ onSubmit: handleSubmit }}>
            <RegisterForm />
        </AppFormWrapper>
    )
}