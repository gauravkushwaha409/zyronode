import { Icon, Input } from '@package/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/components';

export const Route = createFileRoute('/_organization-protected/$organization')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <section className="flex flex-1 flex-col py-2.5 min-w-0">
        <header className="px-5 pb-2.5 flex items-center justify-between">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Icon name="main-search" size={16} />
            </div>
            <Input
              placeholder="Quick Search"
              className="w-120 pl-10 bg-white-base border-gray-border-100 rounded-lg placeholder:text-gray-400"
            />
          </div>
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
