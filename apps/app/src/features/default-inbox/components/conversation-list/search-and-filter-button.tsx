import { Button, Typography } from '@package/ui';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useConversationSearchFilter } from '../../hooks';

export function SearchAndFilterButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchConversation = useConversationSearchFilter();

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    searchConversation.onChange('');
  }, [searchConversation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    },
    [closeSearch],
  );

  const handleBlur = useCallback(() => {
    if (!searchConversation.value) {
      closeSearch();
    }
  }, [searchConversation.value, closeSearch]);

  if (isSearchOpen) {
    return (
      <button type="button" className="px-4 py-2.5 rounded-tl-[12px]" onKeyDown={handleKeyDown}>
        <input
          type="text"
          value={searchConversation.value}
          onChange={(e) => searchConversation.onChange(e.target.value)}
          placeholder="Search Customers..."
          autoFocus
          onBlur={handleBlur}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </button>
    );
  }

  return (
    <div className="pl-4 pr-3.5 py-3.5 flex items-center justify-between rounded-tl-[12px]">
      <Typography.T3 className="text-gray-950" weight="medium">
        All Conversations
      </Typography.T3>
      <div className="flex items-center gap-x-1.5">
        <Button onClick={openSearch} icon="search" size="icon-sm" variant="secondary" />
        <Button icon="filter" size="icon-sm" variant="secondary" />
      </div>
    </div>
  );
}
