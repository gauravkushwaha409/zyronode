import { useConversationItem } from '../../hooks';
import { FilterByActiveStateStatusAndChannel } from './conversation-filters';
import { ConversationListComponent } from './conversation-list.component';
import { EscalateToTeamLeadPopover } from './escalate-to-team-lead-popover';
import { SearchAndFilterButton } from './search-and-filter-button';

export function ConversationList() {
  const { value: conversationUUID } = useConversationItem();
  return (
    <div className="flex flex-col h-full">
      <SearchAndFilterButton />
      <FilterByActiveStateStatusAndChannel />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <ConversationListComponent className="flex-1" />
        {conversationUUID && <EscalateToTeamLeadPopover />}
      </div>
    </div>
  );
}
