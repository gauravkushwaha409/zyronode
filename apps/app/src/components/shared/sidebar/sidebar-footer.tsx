import { Avatar, Typography } from '@package/ui';
import { cn } from '@package/ui';

interface SidebarFooterProps {
  open: boolean;
  userData: any;
}

export function SidebarFooter({ open, userData }: SidebarFooterProps) {
  const profile = userData?.data?.data?.profile;
  const firstName = userData?.data?.data?.firstName ?? '';
  const lastName = userData?.data?.data?.lastName ?? '';
  const email = userData?.data?.data?.email ?? '';
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email;

  return (
    <section className="px-3 shrink-0 flex flex-col gap-6">
      <section className="flex items-center gap-3">
        <Avatar
          key={profile}
          size="xl"
          fallbackType="icon"
          image={profile ?? undefined}
          className="bg-gray-200"
        />
        <section
          className={cn(
            'flex-1 overflow-hidden whitespace-nowrap',
            open ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0',
          )}
        >
          <div className="flex-1 flex flex-col text-start">
            <Typography.T3 weight="medium" className="text-gray-950 truncate max-w-40">
              {fullName}
            </Typography.T3>
            <Typography.T5 weight="regular" className="text-gray-400 truncate max-w-40">
              {email}
            </Typography.T5>
          </div>
        </section>
      </section>
    </section>
  );
}
