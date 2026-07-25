import { useMessageDeleteStore } from '../../store';

interface MessageDeleteDialogProps {
  conversationUUID?: string | null;
}

export function MessageDeleteDialog(_props: MessageDeleteDialogProps) {
  const { message, clearMessage } = useMessageDeleteStore();

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-md space-y-4">
        <h3 className="text-lg font-semibold">Delete message?</h3>
        <p className="text-sm text-gray-500">Are you sure you want to delete this message?</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={clearMessage}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={clearMessage}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
