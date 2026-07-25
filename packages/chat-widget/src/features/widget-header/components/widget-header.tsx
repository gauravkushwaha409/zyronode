interface WidgetHeaderProps {
  onClose: () => void;
}

export function WidgetHeader({ onClose }: WidgetHeaderProps) {
  return (
    <section className="p-4 bg-blue-600 text-white rounded-t-[16px]">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Chat Support</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
        >
          &times;
        </button>
      </div>
      <p className="text-xs text-white/70 mt-1">We typically reply in a few minutes</p>
    </section>
  );
}
