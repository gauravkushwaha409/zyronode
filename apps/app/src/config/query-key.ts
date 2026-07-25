export const QUERY_KEY = {
    AUTH: {
        ME: ['me'],
        LOGIN: ['auth-login'],
        SIGN_UP: ['auth-sign-up'],
    },
    ORGANIZATION: {
        MY: ['organization', 'my']
    },
    INBOX: {
        SESSIONS: (organizationId: string, filters?: Record<string, unknown>) =>
            ['inbox', 'sessions', organizationId, filters] as const,
        SESSION_DETAIL: (sessionId: string | null, organizationId: string) =>
            ['inbox', 'session', sessionId, organizationId] as const,
    },
}
