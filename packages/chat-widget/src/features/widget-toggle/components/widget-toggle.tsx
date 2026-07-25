import { Button } from "@package/ui";

interface WidgetToggleProps {
  onClick: () => void;
}

export function WidgetToggle({ onClick }: WidgetToggleProps) {
  return (
    <section className="fixed bottom-6 right-6 z-[1000]">
      <Button
        type="button"
        onClick={onClick}
        className="h-14 w-14 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </Button>
    </section>
  );
}
