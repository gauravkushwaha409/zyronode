import { useCallback, useState } from 'react';

let _conversationValue: string | null = null;

export function useConversationItem() {
  const [, setTick] = useState(0);

  const value = _conversationValue;

  const onChange = useCallback(
    (conversationId: string | null) => {
      _conversationValue = conversationId;
      setTick((t) => t + 1);
    },
    [],
  );

  return { value, onChange } as const;
}
