import { Avatar, Button, Icon, Typography } from '@package/ui';
import { AIInsight } from './ai-insight';
import { AssignConversationDialog } from './assign-conversation-dialog';
import { ConversationHeaderAction } from './conversation-header-action';
import { ResolveUnresolveDialog } from './resolve-unresolve-dialog';

interface ConversationHeaderProps {
  conversationUUID: string | null;
  visitorName: string | null;
  channel: string | null;
  status: string | null;
}

export function ConversationHeader({ visitorName, status }: ConversationHeaderProps) {
  const isActive = status === 'ACTIVE';

  return (
    <div className="px-4 h-13.5 flex items-center justify-between border-b border-b-gray-200">
      <div className="flex items-center">
        <div className="size-11 relative rounded-full shrink-0">
          <Avatar className="shrink-0" size="xl" fallbackType="text" fallbackText={visitorName?.charAt(0) ?? 'U'} />
          <Icon size={12} name="messenger" className="absolute right-0 -translate-x-1/2 bottom-0 border-2 border-white rounded-full" />
        </div>

        <div className="ml-2.5 flex flex-col">
          <Typography.T3 className="text-gray-950 w-3xs line-clamp-1 break-all" weight="semibold">
            {visitorName ?? 'Unknown Visitor'}
          </Typography.T3>
          <div className="flex items-center gap-x-0.5">
            <Icon name="dot" size={12} className={isActive ? 'text-success-500' : 'text-gray-400'} />
            <Typography.T6 weight="medium" className="text-gray-400">
              {isActive ? 'Online' : 'Offline'}
            </Typography.T6>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-x-3">
          <Button icon="call" size="icon-sm" className="text-gray-500" variant="ghost" />
          <Button icon="video-call" size="icon-sm" className="text-gray-500" variant="ghost" />
        </div>
      </div>

      <div className="flex items-stretch">
        <AIInsight />
        <div className="w-px bg-gray-100 mx-3" />
        <AssignConversationDialog />
        <ResolveUnresolveDialog dialogContentProps={{ className: 'ml-3' }} />
        <ConversationHeaderAction />
      </div>
    </div>
  );
}
