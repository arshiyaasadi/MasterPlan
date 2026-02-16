import { create } from "zustand";

interface AppState {
  /** Example: number of dashboard visits this session (client-only). */
  visitCount: number;
  incrementVisitCount: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  visitCount: 0,
  incrementVisitCount: () =>
    set((state) => ({ visitCount: state.visitCount + 1 })),
}));
