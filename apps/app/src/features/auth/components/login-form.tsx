import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { FormCheckbox, FormInput, FormPassword, useFormContext } from '@package/form';
import { Button, cn } from '@package/ui';
import { Link } from '@tanstack/react-router';
import { useRef } from 'react';

interface LoginFormProps {
  setTurnstileToken: (token: string) => void;
  removeTurnstileToken: () => void;
  isPending: boolean;
}

export function LoginForm({
  setTurnstileToken,
  removeTurnstileToken,
  isPending,
}: LoginFormProps) {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const { formState: { errors } } = useFormContext();
  const captchaError = errors?.captcha_token?.message as string | undefined;

  return (
    <div className="w-full space-y-4">
      <FormInput
        name="email"
        label="Email"
        placeholder="Enter your email"
      />

      <FormPassword
        name="password"
        label="Password"
        placeholder="Enter your password"
      />

      <div className="flex flex-row items-center justify-between">
        <FormCheckbox name="checkbox" label="Remember Me" />
        <Link
          to="/auth/forgot-password"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Forgot Password
        </Link>
      </div>

      <div className={cn("space-y-3", captchaError && "space-y-1")}>
        <Turnstile
          ref={turnstileRef}
          onSuccess={(token) => setTurnstileToken(token)}
          siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
          onExpire={removeTurnstileToken}
          options={{
            size: 'flexible',
            theme: 'light',
          }}
        />
        {captchaError && (
          <p role="alert" className="text-destructive text-sm">
            {captchaError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        size="xl"
      >
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </div>
  );
}
