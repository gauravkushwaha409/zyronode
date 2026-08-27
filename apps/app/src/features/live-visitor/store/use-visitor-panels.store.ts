import { create } from "zustand";

type VisitorPanel = "details" | "edit" | "assign" | null;

interface VisitorPanelsState {
	/** Which visitor the open panel refers to. */
	visitorId: string | null;
	openPanel: VisitorPanel;
	/** The drawer is independent of the dialogs - both can be relevant at once. */
	drawerVisitorId: string | null;

	openDetails: (visitorId: string) => void;
	openEdit: (visitorId: string) => void;
	openAssign: (visitorId: string) => void;
	closePanel: () => void;

	openDrawer: (visitorId: string) => void;
	closeDrawer: () => void;
}

export const useVisitorPanelsStore = create<VisitorPanelsState>((set) => ({
	visitorId: null,
	openPanel: null,
	drawerVisitorId: null,

	openDetails: (visitorId) => set({ visitorId, openPanel: "details" }),
	openEdit: (visitorId) => set({ visitorId, openPanel: "edit" }),
	openAssign: (visitorId) => set({ visitorId, openPanel: "assign" }),
	closePanel: () => set({ visitorId: null, openPanel: null }),

	openDrawer: (visitorId) => set({ drawerVisitorId: visitorId }),
	closeDrawer: () => set({ drawerVisitorId: null }),
}));
