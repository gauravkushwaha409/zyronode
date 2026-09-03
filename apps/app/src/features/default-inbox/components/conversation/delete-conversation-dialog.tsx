import { ConfirmationDialog } from "@package/ui";
import { useParams } from "@tanstack/react-router";
import { useSoftDeleteConversationMutation } from "../../hooks/mutations/use-soft-delete-conversation.mutation";
import { useConversationDeleteStore } from "../../store/use-conversation-delete.store";

export function DeleteConversationDialog() {
	const params = useParams({ strict: false }) as { organization?: string };
	const fallbackOrgId = params.organization ?? "";

	const { target, clearTarget } = useConversationDeleteStore();
	const isOpen = !!target;
	const effectiveOrgId = target?.organizationId ?? fallbackOrgId;

	const softDeleteMutation = useSoftDeleteConversationMutation(effectiveOrgId);

	const handleConfirm = () => {
		if (!target) return;
		softDeleteMutation.mutate(
			{ conversationId: target.conversationId },
			{
				onSuccess: () => clearTarget(),
			},
		);
	};

	return (
		<ConfirmationDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) clearTarget();
			}}
			title="Delete conversation?"
			description="This conversation will be removed from your inbox for all members."
			paragraph="Are you sure you want to delete this conversation? This action cannot be undone."
			variant="alert"
			confirmLabel="Delete"
			cancelLabel="Cancel"
			isPending={softDeleteMutation.isPending}
			pendingText="Deleting..."
			onConfirm={handleConfirm}
		/>
	);
}
