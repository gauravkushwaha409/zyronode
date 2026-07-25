import { Icon } from '@package/ui';
import { forwardRef } from 'react';
import { InternalNotesBanner } from './internal-notes-banner';

interface TextEditorProps {
  className?: string;
}

export const TextEditor = forwardRef<HTMLDivElement, TextEditorProps>(
  function TextEditor({ className }, ref) {
    return (
      <div
        ref={ref}
        className={`absolute bottom-0 inset-x-0 px-4 py-3 shrink-0 ${className}`}
      >
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <InternalNotesBanner />
          <div className="px-4 py-3">
            <div
              contentEditable
              className="min-h-[40px] max-h-[200px] overflow-y-auto text-sm text-gray-800 outline-none"
              data-placeholder="Type a message..."
            />
          </div>
          <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button type="button" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
                <Icon name="add-attatchments" size={18} />
              </button>
              <button type="button" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
                <Icon name="send-emojis" size={18} />
              </button>
            </div>
            <button type="button" className="p-1.5 rounded-md bg-primary-500 text-white hover:bg-primary-600">
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  },
);
