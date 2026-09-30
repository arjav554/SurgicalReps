import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * Storage for the persisted stores.
 *
 * On the web this is the browser's own storage, read synchronously, so a refresh restores the stores
 * before the first render instead of flashing defaults (AsyncStorage answers on a later tick).
 * The keys and values are the same ones AsyncStorage writes on the web, so nothing already saved is lost.
 */

function browserStorage(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    return typeof window !== 'undefined' ? window[kind] : null;
  } catch {
    // Blocked by browser settings (e.g. cookies and site data disabled).
    return null;
  }
}

/** Survives closing the app: progress, profile, settings, sync bookkeeping. */
export const deviceStorage: StateStorage = browserStorage('localStorage') ?? AsyncStorage;

const nothing: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * Survives a page refresh but not closing the tab, so "where you were" never outlives the visit.
 * Outside the browser there is no refresh, so nothing is kept.
 */
export const visitStorage: StateStorage = browserStorage('sessionStorage') ?? nothing;
