import { create } from "zustand";

type DialogStateItem = {
	open: boolean;
};

type DialogState = {
	dialogs: Record<string, DialogStateItem>;

	openDialog: (key: string) => void;
	closeDialog: (key: string) => void;
};

export const useDialogStore = create<DialogState>((set, get) => ({
	dialogs: {},

	openDialog: (key) =>
		set((state) => ({
			dialogs: {
				...state.dialogs,
				[key]: { open: true },
			},
		})),

	closeDialog: (key) =>
		set((state) => ({
			dialogs: {
				...state.dialogs,
				[key]: { open: false },
			},
		})),

	isOpen: (key: string) => get().dialogs[key]?.open ?? false,
}));

export function useDialogOpen({ key }: { key: string }) {
	const openDialog = useDialogStore((state) => state.openDialog);
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const isOpen = useDialogStore((state) => state.dialogs[key]?.open ?? false);

	return {
		open: () => openDialog(key),
		close: () => closeDialog(key),
		isOpen,
	};
}
