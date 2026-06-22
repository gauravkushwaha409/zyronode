import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@package/form'
import { z } from 'zod'
import { FormInput, FormWrapper } from '@package/form'
import { Button, toast } from '@package/ui'
import { useMeQuery, useResendEmailMutation, useVerifyEmailMutation } from '@/features/auth/hooks'
import { queryClient } from '@/lib/query-client'
import { CONFIG } from '@/config'
import { authApiService } from '@/features/auth/services'

const verifyEmailSchema = z.object({
  token: z.string().length(6, 'Code must be exactly 6 characters'),
})

type VerifyEmailForm = z.infer<typeof verifyEmailSchema>

function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setTimeLeft(seconds)
    setIsRunning(true)
  }, [seconds])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft <= 0) {
      stop()
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, stop])

  return { start, stop, timeLeft, isRunning }
}

export function VerifyEmailPage() {
  const router = useRouter()
  const { data: meData } = useMeQuery()
  const verifyEmailMutation = useVerifyEmailMutation()
  const resendEmailMutation = useResendEmailMutation()
  const { start, timeLeft, isRunning } = useCountdown(30)
  const email = meData?.data?.data?.email || 'your email'
  const progress = ((30 - timeLeft) / 30) * 100

  const form = useForm<VerifyEmailForm>({
    schema: verifyEmailSchema,
    defaultValues: { token: '' },
  })

  const handleSubmit = form.handleSubmit(
    (data) => {
      verifyEmailMutation.mutate(
        { token: data.token },
        {
          onSuccess: async (response) => {
            toast.success(response?.data?.message || 'Email verified successfully')

            await queryClient.fetchQuery({
              queryKey: CONFIG.QUERY_KEY.AUTH.ME,
              queryFn: () => authApiService.me(),
            })

            router.navigate({ to: '/auth/login' })
          },
          onError: (error) => {
            toast.error(error?.response?.data?.error || 'Verification failed')
          },
        },
      )
    },
    () => {
      toast.error('Please enter a valid 6-digit code')
    },
  )

  const handleResend = () => {
    if (isRunning) return
    resendEmailMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data?.data?.message || 'Verification email resent')
        start()
      },
      onError: (error) => {
        toast.error(error?.response?.data?.error || 'Failed to resend verification email')
      },
    })
  }

  return (
    <section className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Verify your Email</h1>
          <p className="text-sm text-gray-500">
            Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <FormWrapper
          useFormMethods={form}
          formProps={{ onSubmit: handleSubmit }}
        >
          <div className="space-y-4">
            <FormInput
              name="token"
              label="Verification Code"
              placeholder="Enter the 6-digit code"
            />

            <div className="flex items-center gap-3">
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

            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={verifyEmailMutation.isPending}
            >
              {verifyEmailMutation.isPending ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </FormWrapper>

        <div className="flex justify-center">
          <Link
            to="/auth/login"
            className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </section>
  )
}