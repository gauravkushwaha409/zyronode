import { useCallback, useState } from 'react';

let _searchValue = '';

export function useConversationSearchFilter() {
  const [, setTick] = useState(0);

  const value = _searchValue;

  const onChange = useCallback(
    (newValue: string) => {
      _searchValue = newValue;
      setTick((t) => t + 1);
    },
    [],
  );

  return { value, onChange } as const;
}
