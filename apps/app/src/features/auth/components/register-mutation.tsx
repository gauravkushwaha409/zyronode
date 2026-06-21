import { FormWrapper } from '@package/form';
import { useSignUpForm } from '../hooks';
import { SignUpForm } from './sign-up';

export function RegisterMutation() {
  const signUpForm = useSignUpForm();

  const handleSubmit = signUpForm.form.handleSubmit(
    (data) => {
      switch (data.step) {
        case 1:
          signUpForm.handleStep1();
          return;
        case 2:
          signUpForm.handleStep2(data);
          return;
        case 3: {
          signUpForm.handleStep3({ token: data?.token });
          return;
        }
      }
    },
    (error) => {
      console.error(error);
    },
  );

  return (
    <FormWrapper
      useFormMethods={signUpForm.form}
      formProps={{ onSubmit: handleSubmit }}
    >
      {signUpForm.currentStep === 1 && (
        <SignUpForm.Step1 setTurnstileToken={signUpForm.setTurnstileToken} />
      )}
      {signUpForm.currentStep === 2 && (
        <SignUpForm.Step2
          isPending={signUpForm.signUpMutation.isPending}
          onBack={signUpForm.prevStep}
        />
      )}
      {signUpForm.currentStep === 3 && (
        <SignUpForm.Step3
          email={signUpForm.form.getValues('email')}
          onBack={signUpForm.prevStep}
          handleResend={signUpForm.handleResendEmail}
          progress={signUpForm.progress}
          isRunning={signUpForm.isResendEmailCountDown}
          timeLeft={signUpForm.resendEmailTimeLeft}
        />
      )}
    </FormWrapper>
  );
}
