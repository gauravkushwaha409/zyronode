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
        CONVERSATIONS: (organizationId: string, filters?: Record<string, unknown>) =>
            ['inbox', 'conversations', organizationId, filters] as const,
        CONVERSATION_DETAIL: (conversationId: string | null, organizationId: string) =>
            ['inbox', 'conversation', conversationId, organizationId] as const,
    },
}
