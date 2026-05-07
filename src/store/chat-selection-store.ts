import { create } from 'zustand';

interface ChatSelectionStore {
    isSelectionMode: boolean;
    selectedIds: Set<string>;
    enterSelectionMode: (id?: string) => void;
    exitSelectionMode: () => void;
    toggleSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearAll: () => void;
    contextMenuItemId: string | null;
    openContextMenu: (id: string) => void;
    closeContextMenu: () => void;
}

export const useChatSelectionStore = create<ChatSelectionStore>((set) => ({
    isSelectionMode: false,
    selectedIds: new Set(),

    enterSelectionMode: (id) =>
        set(() => ({
            isSelectionMode: true,
            selectedIds: id ? new Set([id]) : new Set(),
        })),

    exitSelectionMode: () =>
        set({ isSelectionMode: false, selectedIds: new Set() }),

    toggleSelection: (id) =>
        set((state) => {
            const next = new Set(state.selectedIds);
            next.has(id) ? next.delete(id) : next.add(id);
            return { selectedIds: next };
        }),

    selectAll: (ids) =>
        set({ selectedIds: new Set(ids) }),

    clearAll: () =>
        set({ selectedIds: new Set() }),
    contextMenuItemId: null,
    openContextMenu: (id) => set({ contextMenuItemId: id }),
    closeContextMenu: () => set({ contextMenuItemId: null }),
}));