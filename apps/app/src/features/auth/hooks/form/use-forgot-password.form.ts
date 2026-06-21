import { useForm } from '@package/form';
import { forgotPasswordSchema, type ForgotPasswordSchema } from '../../schema';

export function useForgotPasswordForm() {
  const form = useForm<ForgotPasswordSchema>({
    defaultValues: { email: '' },
    schema: forgotPasswordSchema,
  });
  return { form };
}
