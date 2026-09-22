import { useDeleteMessageMutation } from '../../hooks';
import { useMessageDeleteStore } from '../../store';

interface MessageDeleteDialogProps {
  conversationUUID?: string | null;
  organizationId: string;
}

export function MessageDeleteDialog({ organizationId }: MessageDeleteDialogProps) {
  const { message, clearMessage } = useMessageDeleteStore();
  const { mutate: deleteMessage, isPending } = useDeleteMessageMutation(organizationId);

  if (!message) return null;

  const handleDelete = () => {
    deleteMessage(
      { conversationId: message.conversation_uuid, messageId: message.uuid },
      { onSuccess: clearMessage },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-md space-y-4">
        <h3 className="text-lg font-semibold">Delete message?</h3>
        <p className="text-sm text-gray-500">Are you sure you want to delete this message?</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={clearMessage}
            disabled={isPending}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
