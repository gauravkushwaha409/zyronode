import { useForm } from '@package/form';
import { toast } from '@package/ui';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { signUpSchema, type SignUpSchema } from '../../schema';
import {
  useResendEmailMutation,
  useSignUpMutation,
  useVerifyEmailMutation,
} from '../mutation';

const STORAGE_KEY = 'signup_form';

function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [seconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      stop();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, stop]);

  return { start, stop, timeLeft, isRunning };
}

export function useSignUpForm() {
  const resendEmailMutation = useResendEmailMutation();
  const { start, timeLeft, isRunning } = useCountdown(30);
  const signUpMutation = useSignUpMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const navigate = useNavigate();

  const saved =
    typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
  const defaultValues = saved
    ? JSON.parse(saved)
    : { email: '', password: '', token: '', step: 1, captcha_token: '' };

  const form = useForm<SignUpSchema>({
    schema: signUpSchema,
    defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const nextStep = () => {
    const currentStep = form.getValues('step') || 1;
    if (currentStep < 3) {
      form.setValue('step', (currentStep + 1) as 1 | 2 | 3);
    }
  };

  const prevStep = () => {
    const currentStep = form.getValues('step') || 1;
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as 1 | 2 | 3;
      form.setValue('step', prevStep);
      form.clearErrors();
    }
  };

  const handleResendEmail = () => {
    if (isRunning) return;
    const email = form.getValues('email');
    resendEmailMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          toast.success(
            data?.data?.message || 'Verification email resent successfully',
          );
          start();
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.error || 'Failed to resend verification email',
          );
        },
      },
    );
  };

  const progress = ((30 - timeLeft) / 30) * 100;

  const handleStep1 = async () => {
    nextStep();
  };

  const handleStep2 = async (data: SignUpSchema) => {
    if (data?.step === 2) {
      signUpMutation.mutate(
        {
          email: data.email,
          password: data.password,
          captcha_token: data?.captcha_token,
        },
        {
          onSuccess: () => {
            sessionStorage.removeItem(STORAGE_KEY);
            nextStep();
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.error ||
                'Something went wrong. Please try again.',
            );
          },
        },
      );
    }
  };

  const handleStep3 = async (data: { token: string }) => {
    const email = form.getValues('email');
    verifyEmailMutation.mutate(
      { email, code: data.token },
      {
        onSuccess: (data) => {
          toast.success(data?.data?.message);
          navigate({ to: '/auth/login', replace: true });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.error || 'Something went wrong');
        },
      },
    );
  };

  useEffect(() => {
    return () => {
      sessionStorage.removeItem(STORAGE_KEY);
    };
  }, []);

  const setTurnstileToken = (token: string) => {
    form.setValue('captcha_token', token, { shouldValidate: true });
  };

  const removeTurnstileToken = () => {
    form.setValue('captcha_token', '', { shouldValidate: true });
  };

  return {
    form,
    currentStep: form.watch('step') || 1,
    nextStep,
    prevStep,
    handleResendEmail,
    progress,
    isResendEmailCountDown: isRunning,
    resendEmailTimeLeft: timeLeft,
    handleStep1,
    handleStep2,
    handleStep3,
    signUpMutation,
    setTurnstileToken,
    removeTurnstileToken,
  };
}
