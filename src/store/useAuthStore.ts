import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** `unavailable`: this build has no Supabase project, so the app is device-only. */
export type AuthStatus = 'unavailable' | 'loading' | 'signedOut' | 'signedIn';
export type SyncPhase = 'idle' | 'syncing' | 'synced' | 'error';

interface AuthState {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  /** Arrived through a password-reset link; the account screen asks for a new password. */
  recovering: boolean;
  /** Problem with a confirmation or reset link (e.g. expired). */
  linkError: string | null;
  sync: SyncPhase;
  syncError: string | null;
  /** The account's saved profile has been fetched since signing in, so a missing one is really missing. */
  profileChecked: boolean;
}

/** Session state. Supabase persists the session itself, so this store is in-memory. */
export const useAuthStore = create<AuthState>()(() => ({
  status: 'loading',
  userId: null,
  email: null,
  recovering: false,
  linkError: null,
  sync: 'idle',
  syncError: null,
  profileChecked: false,
}));

interface SyncState {
  /** Account whose progress this device holds; null while playing as a guest. */
  ownerId: string | null;
  /** Procedures changed on this device since the last successful sync. */
  pending: string[];
  lastSyncedAt: number | null;
  markPending: (ids: string[]) => void;
}

/** Sync bookkeeping, persisted so unsynced runs survive an app restart. */
export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      ownerId: null,
      pending: [],
      lastSyncedAt: null,
      markPending: (ids) => set((s) => ({ pending: [...new Set([...s.pending, ...ids])] })),
    }),
    {
      name: 'mental-reps/sync',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ ownerId, pending, lastSyncedAt }) => ({ ownerId, pending, lastSyncedAt }),
    },
  ),
);
