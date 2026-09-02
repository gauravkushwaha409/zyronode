import { Icon, Input } from '@package/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/components';
import { activeOrganizationGuard } from '@/features/auth/gaurds';

export const Route = createFileRoute('/_organization-protected/$organization')({
  beforeLoad: ({ context, params }) => {
    activeOrganizationGuard({
      auth: context.auth,
      organizationId: params.organization,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <section className="flex flex-1 flex-col py-2.5 min-w-0">
        <header className="px-5 pb-2.5 flex items-center justify-between">
          <Input
            leftIcon="main-search"
            className="bg-white-base w-100 border-gray-200"
            placeholder="Quick Search"
            rightIcon={
              <div className="flex gap-1.5 text-primary-400">
                <Icon name="command" size={20} className="p-px rounded-xs bg-primary-50" />
                <Icon name="k" size={20} className="p-px rounded-xs bg-primary-50" />
              </div>
            }
          />
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-fill-50 transition-colors"
          >
            <Icon name="notifications" size={20} />
          </button>
        </header>

        <div className="flex-1 bg-white-base rounded-l-[12px] overflow-hidden shadow-sm border border-gray-border-50">
          <Outlet />
        </div>
      </section>
    </section>
  );
}
