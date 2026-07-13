import { FormHeader } from '@/features/auth/components';
import {
  useForgotPasswordForm,
  useForgotPasswordMutation,
} from '@/features/auth/hooks';
import { FormInput, FormWrapper } from '@package/form';
import { Button } from '@package/ui';
import { Link } from '@tanstack/react-router';

export default function ForgotPassword() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const forgotPasswordForm = useForgotPasswordForm();

  const handleForgotPasswordSubmit = forgotPasswordForm.form.handleSubmit(
    (data) => {
      forgotPasswordMutation.mutate(data);
    },
  );

  return (
    <section className="space-y-4 2xl:space-y-6">
      <FormHeader
        heading="Reset Your Password"
        description="Enter your registered email address and we'll send you a password reset link."
      />
      <FormWrapper
        useFormMethods={forgotPasswordForm.form}
        className="space-y-4 2xl:space-y-6"
        formProps={{
          onSubmit: handleForgotPasswordSubmit,
        }}
      >
        <FormInput
          label="Email"
          placeholder="Enter a mail"
          name="email"
          leftIcon="email"
          required
        />
        <Button type="submit" size="xl" className='w-full'>
          Send Reset Link
        </Button>
      </FormWrapper>
      <div className="flex justify-center">
        <Link
          to="/auth/login"
          className="w-fit underline text-primary-600 font-medium"
        >
          Return to login
        </Link>
      </div>
    </section>
  );
}
