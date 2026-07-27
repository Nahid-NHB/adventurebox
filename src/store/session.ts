/**
 * Session store — small, hot UI state. The active child selection and cached
 * daily-pick offset live here. Durable data lives in SQLite; this is ephemeral
 * plus a couple of KV-backed flags.
 */
import { create } from 'zustand';
import { kv } from '@/services/kv';

interface SessionState {
  activeChildId: string | null;
  /** "Another" taps advance this offset per child, resets daily via the hook. */
  pickOffset: number;
  setActiveChild: (id: string) => void;
  nextPick: () => void;
  resetPick: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeChildId: kv.getString('activeChildId') ?? null,
  pickOffset: 0,
  setActiveChild: (id) => {
    void kv.set('activeChildId', id);
    set({ activeChildId: id, pickOffset: 0 });
  },
  nextPick: () => set((s) => ({ pickOffset: s.pickOffset + 1 })),
  resetPick: () => set({ pickOffset: 0 }),
}));
