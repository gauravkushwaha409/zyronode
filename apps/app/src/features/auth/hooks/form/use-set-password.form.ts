import { useForm } from '@package/form';
import { setPasswordSchema, type SetPasswordSchema } from '../../schema';

export function useSetPasswordForm() {
  const form = useForm<SetPasswordSchema>({
    schema: setPasswordSchema,
    defaultValues: { password: '', confirmPassword: '' },
  });
  return { form };
}
