import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

export function useConversationItem() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;

  const value = useMemo(() => {
    const raw = search.conversation;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  }, [search.conversation]);

  const onChange = useCallback(
    (conversationId: string | null) => {
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          conversation: conversationId,
        }),
        replace: true,
      } as never);
    },
    [navigate],
  );

  return { value, onChange } as const;
}
