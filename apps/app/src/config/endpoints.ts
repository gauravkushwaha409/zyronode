export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/sign-up',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/password/forgot',
        VERIFY_FORGOT_PASSWORD: '/auth/password/forgot/verify',
        VERIFY_EMAIL: '/otp/verify',
        RESEND_EMAIL: '/auth/resend-verification',
    },
    ORGANIZATION: {
        CREATE: '/organization',
        GET_MY: '/organization/my',
    }
}