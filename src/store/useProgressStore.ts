import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TerminalStatus } from '@/types/procedure';

/** Consecutive clean runs needed to call a procedure mastered. Options shuffle and cases vary per run. */
export const MASTERY_STREAK = 3;

export interface ProcedureProgress {
  attempts: number;
  successes: number;
  currentStreak: number;
  bestStreak: number;
  bestTimeMs: number | null;
  lastOutcome: TerminalStatus | null;
  lastPlayedAt: number | null;
}

export const EMPTY_PROGRESS: ProcedureProgress = {
  attempts: 0,
  successes: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestTimeMs: null,
  lastOutcome: null,
  lastPlayedAt: null,
};

interface ProgressState {
  byProcedure: Record<string, ProcedureProgress>;
  recordRun: (procedureId: string, outcome: TerminalStatus, durationMs: number, at: number) => void;
  /** Swap in progress merged from the account (or clear it on sign-out). */
  replaceAll: (byProcedure: Record<string, ProcedureProgress>) => void;
  resetAll: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      byProcedure: {},

      recordRun: (procedureId, outcome, durationMs, at) =>
        set((state) => {
          const prev = state.byProcedure[procedureId] ?? EMPTY_PROGRESS;
          const succeeded = outcome === 'success';
          const currentStreak = succeeded ? prev.currentStreak + 1 : 0;
          const next: ProcedureProgress = {
            attempts: prev.attempts + 1,
            successes: prev.successes + (succeeded ? 1 : 0),
            currentStreak,
            bestStreak: Math.max(prev.bestStreak, currentStreak),
            bestTimeMs:
              succeeded && (prev.bestTimeMs === null || durationMs < prev.bestTimeMs)
                ? durationMs
                : prev.bestTimeMs,
            lastOutcome: outcome,
            lastPlayedAt: at,
          };
          return { byProcedure: { ...state.byProcedure, [procedureId]: next } };
        }),

      replaceAll: (byProcedure) => set({ byProcedure }),

      resetAll: () => set({ byProcedure: {} }),
    }),
    {
      name: 'mental-reps/progress',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ byProcedure: state.byProcedure }),
    },
  ),
);

export function useProcedureProgress(procedureId: string): ProcedureProgress {
  return useProgressStore((state) => state.byProcedure[procedureId] ?? EMPTY_PROGRESS);
}

export function isMastered(progress: ProcedureProgress): boolean {
  return progress.currentStreak >= MASTERY_STREAK;
}
