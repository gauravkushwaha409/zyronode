import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { FormInput, FormPassword } from '@package/form';
import { Button } from '@package/ui';
import { Link } from '@tanstack/react-router';
import { useRef } from 'react';
import { FormHeader } from '../form-header';
import { Google } from '../google';

const Step1 = ({
  setTurnstileToken,
}: {
  setTurnstileToken: (token: string) => void;
}) => {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  return (
    <div className="space-y-4">
      <FormHeader
        heading="Get Started"
        description="Start with the following details to create your free account."
      />
      <Google text="Continue with Google" />
      <p className="text-center text-sm text-gray-400">Or</p>
      <FormInput
        name="email"
        label="Email"
        placeholder="Enter your email"
      />
      <Turnstile
        ref={turnstileRef}
        siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
        onSuccess={(token) => setTurnstileToken(token)}
        options={{
          size: 'flexible',
        }}
      />
      <Button type="submit" size="xl" className="w-full">
        Continue
      </Button>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">
          Already have an account?
        </p>
        <Link
          to="/auth/login"
          className="text-sm font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

const Step2 = ({
  onBack,
  isPending,
}: {
  onBack: () => void;
  isPending: boolean;
}) => {
  return (
    <div className="space-y-4">
      <FormHeader
        heading="Create a Password"
        description="Set a strong password to secure your account."
      />

      <div className="space-y-4">
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
        <Button type="submit" size="xl" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Continue'}
        </Button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-normal text-blue-600 underline cursor-pointer text-center w-full"
      >
        Return to Sign Up
      </button>
    </div>
  );
};

const Step3 = ({
  email,
  onBack,
  handleResend,
  progress,
  isRunning,
  timeLeft,
}: {
  onBack: () => void;
  email: string;
  handleResend: () => void;
  progress: number;
  isRunning: boolean;
  timeLeft: number;
}) => {
  return (
    <div className="space-y-4">
      <FormHeader
        heading="Verify your Email"
        description={`Enter the 6-digit code sent to ${email || 'your email'} to complete verification.`}
      />

      <div className="space-y-4">
        <FormInput
          name="token"
          label="Verification Code"
          placeholder="Enter the 6-digit code"
        />
        <div className="flex gap-3 items-center">
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: `conic-gradient(#7c3aed ${progress}%, #e5e7eb 0%)`,
              position: 'relative',
              transition: 'background 0.5s linear',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '3px',
                background: 'white',
                borderRadius: '100%',
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={isRunning}
            className={`text-sm transition-opacity ${
              !isRunning ? 'text-blue-600 cursor-pointer' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            {isRunning ? `Resend Code in ${timeLeft}s` : 'Resend Code'}
          </button>
        </div>
        <Button type="submit" size="xl" className="w-full">
          Sign Up
        </Button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-blue-600 underline w-full text-center cursor-pointer font-normal"
      >
        Back
      </button>
    </div>
  );
};

export const SignUpForm = {
  Step1,
  Step2,
  Step3,
};
