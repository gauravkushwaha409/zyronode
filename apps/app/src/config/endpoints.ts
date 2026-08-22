export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/sign-up',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/password/forgot',
        VERIFY_FORGOT_PASSWORD: '/auth/password/forgot/verify',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_EMAIL: '/auth/resend-verification',
        USER_ONBOARDING: '/auth/user-onboarding',
    },
    ORGANIZATION: {
        CREATE: '/organization',
        GET_MY: '/organization/my',
    },
    INBOX: {
        CONVERSATIONS: '/inbox/conversations',
        CONVERSATION: '/inbox/conversations',
        SEND_MESSAGE: '/conversations',
        MARK_READ: '/conversations',
    },
}