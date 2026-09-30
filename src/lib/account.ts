import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { AppState, Platform } from 'react-native';

import { describeAuthError } from '@/lib/authMessages';
import {
  changedIds,
  fromRows,
  mergeProgress,
  mergeRecord,
  newerProfile,
  profileFromRow,
  profileToRow,
  toRow,
  type ProfileRow,
  type ProgressMap,
  type ProgressRow,
} from '@/lib/progressMerge';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useSyncStore } from '@/store/useAuthStore';
import { useProfileStore, type LearnerProfile } from '@/store/useProfileStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useSimulationStore } from '@/store/useSimulationStore';

/**
 * Optional accounts. Signed out, progress and the learner profile live on the device as before.
 * Signed in, they are merged with the account on sign-in and kept in sync after each change.
 */

export type AuthResult = { ok: true; notice?: string } | { ok: false; error: string };

const SYNC_DEBOUNCE_MS = 1500;

let applyingRemote = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

const setAuth = useAuthStore.setState;

/** Wire up session tracking, sync triggers and auth links. Call once from the root layout. */
export function startAccount(): () => void {
  const client = supabase;
  if (!client) {
    setAuth({ status: 'unavailable' });
    return () => {};
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    // Supabase advises against calling back into the client from inside this callback.
    setTimeout(() => onAuthEvent(event, session), 0);
  });

  // Every recorded run is queued for upload; signed in, it goes up shortly after.
  const unsubscribeProgress = useProgressStore.subscribe((state, previous) => {
    if (applyingRemote) return;
    const ids = Object.keys(state.byProcedure).filter((id) => state.byProcedure[id] !== previous.byProcedure[id]);
    if (ids.length === 0) return;
    useSyncStore.getState().markPending(ids);
    if (useAuthStore.getState().status === 'signedIn') scheduleSync();
  });
  const unsubscribeProfile = useProfileStore.subscribe((state, previous) => {
    if (applyingRemote || state.profile === previous.profile) return;
    if (useAuthStore.getState().status === 'signedIn') scheduleSync(300);
  });

  const appState = AppState.addEventListener('change', (state) => {
    if (Platform.OS !== 'web') {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    }
    if (state === 'active' && useAuthStore.getState().status === 'signedIn') scheduleSync(0);
  });

  let linkSubscription: { remove: () => void } | null = null;
  if (Platform.OS === 'web') {
    // Supabase reads successful links itself; surface failures such as an expired link.
    if (typeof window !== 'undefined') readLinkError(window.location.hash);
  } else {
    linkSubscription = Linking.addEventListener('url', ({ url }) => void completeAuthLink(url));
    void Linking.getInitialURL().then((url) => {
      if (url) void completeAuthLink(url);
    });
  }

  return () => {
    subscription.unsubscribe();
    unsubscribeProgress();
    unsubscribeProfile();
    appState.remove();
    linkSubscription?.remove();
    if (syncTimer) clearTimeout(syncTimer);
  };
}

function onAuthEvent(event: AuthChangeEvent, session: Session | null) {
  if (event === 'PASSWORD_RECOVERY') setAuth({ recovering: true, linkError: null });
  const user = session?.user;
  if (user) {
    const { status, userId } = useAuthStore.getState();
    const alreadyIn = status === 'signedIn' && userId === user.id;
    setAuth({ status: 'signedIn', userId: user.id, email: user.email ?? null });
    if (!alreadyIn) {
      setAuth({ profileChecked: false });
      scheduleSync(0);
    }
  } else {
    setAuth({
      status: 'signedOut',
      userId: null,
      email: null,
      recovering: false,
      sync: 'idle',
      syncError: null,
      profileChecked: false,
    });
  }
}

/** Where confirmation and reset emails send people back to. Must be allow-listed in Supabase. */
function redirectUrl(): string {
  return Linking.createURL('/account');
}

function readLinkError(fragmentOrUrl: string): boolean {
  const fragment = fragmentOrUrl.includes('#') ? fragmentOrUrl.split('#')[1] ?? '' : fragmentOrUrl.replace(/^#/, '');
  const description = new URLSearchParams(fragment).get('error_description');
  if (!description) return false;
  setAuth({ linkError: description.replace(/\+/g, ' ') });
  return true;
}

/** Native: an email link opened the app with the session in the URL fragment. */
async function completeAuthLink(url: string) {
  const client = supabase;
  if (!client || !url.includes('#') || readLinkError(url)) return;
  const params = new URLSearchParams(url.split('#')[1]);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return;
  const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (error) setAuth({ linkError: describeAuthError(error) });
  else if (params.get('type') === 'recovery') setAuth({ recovering: true, linkError: null });
}

// ——— Sync ———

function scheduleSync(delay = SYNC_DEBOUNCE_MS) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void syncNow();
  }, delay);
}

function whenHydrated(store: { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }) {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

function applyLocal(next: ProgressMap) {
  applyingRemote = true;
  try {
    useProgressStore.getState().replaceAll(next);
  } finally {
    applyingRemote = false;
  }
}

function applyProfile(next: LearnerProfile | null) {
  applyingRemote = true;
  try {
    useProfileStore.getState().replace(next);
  } finally {
    applyingRemote = false;
  }
}

let running: Promise<boolean> | null = null;
let again = false;

/** Pull the account's progress, merge it with this device's, and push back what changed. */
export function syncNow(): Promise<boolean> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    let ok = false;
    do {
      again = false;
      ok = await syncOnce();
    } while (again && ok);
    return ok;
  })().finally(() => {
    running = null;
  });
  return running;
}

async function syncOnce(): Promise<boolean> {
  const client = supabase;
  const { userId } = useAuthStore.getState();
  if (!client || !userId) return false;
  await Promise.all([whenHydrated(useProgressStore), whenHydrated(useSyncStore), whenHydrated(useProfileStore)]);

  setAuth({ sync: 'syncing', syncError: null });
  const local = useProgressStore.getState().byProcedure;
  const localProfile = useProfileStore.getState().profile;
  const { ownerId, pending: pendingBefore } = useSyncStore.getState();
  // Guest data joins the account; data left over from a different account does not.
  const mine = ownerId === null || ownerId === userId;
  const base = mine ? local : {};
  const stillSameUser = () => useAuthStore.getState().userId === userId;

  try {
    const { data, error } = await client.from('progress').select('*');
    if (error) throw error;
    const remote = fromRows((data ?? []) as ProgressRow[]);
    const merged = mergeProgress(base, remote);
    const upload = changedIds(merged, remote);
    if (upload.length > 0) {
      const rows = upload.map((id) => toRow(userId, id, merged[id]!));
      const { error: upsertError } = await client.from('progress').upsert(rows, { onConflict: 'user_id,procedure_id' });
      if (upsertError) throw upsertError;
    }

    const { data: profileData, error: profileError } = await client.from('profiles').select('*').maybeSingle();
    if (profileError) throw profileError;
    const remoteProfile = profileFromRow(profileData as ProfileRow | null);
    const profile = newerProfile(mine ? localProfile : null, remoteProfile);
    if (profile && profile !== remoteProfile) {
      const { error: saveError } = await client
        .from('profiles')
        .upsert(profileToRow(userId, profile), { onConflict: 'user_id' });
      if (saveError) throw saveError;
    }
    if (!stillSameUser()) return false;
    // A profile edited during the sync is newer still; the subscription syncs it next.
    if (useProfileStore.getState().profile === localProfile) applyProfile(profile);

    // Keep any run finished while we were talking to the server; it goes up on the next pass.
    const current = useProgressStore.getState().byProcedure;
    const changedMeanwhile = Object.keys(current).filter((id) => current[id] !== local[id]);
    const next = { ...merged };
    for (const id of changedMeanwhile) {
      const recent = current[id]!;
      next[id] = merged[id] ? mergeRecord(recent, merged[id]) : recent;
    }
    applyLocal(next);

    useSyncStore.setState((s) => ({
      ownerId: userId,
      lastSyncedAt: Date.now(),
      pending: s.pending.filter((id) => !pendingBefore.includes(id) || changedMeanwhile.includes(id)),
    }));
    if (changedMeanwhile.length > 0) again = true;
    setAuth({ sync: 'synced', profileChecked: true });
    return true;
  } catch (error) {
    if (stillSameUser()) setAuth({ sync: 'error', syncError: describeAuthError(error) });
    return false;
  }
}

// ——— Actions for the account screen ———

function unavailable(): AuthResult {
  return { ok: false, error: 'Accounts aren’t set up in this build.' };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return unavailable();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? { ok: false, error: describeAuthError(error) } : { ok: true };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return unavailable();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: redirectUrl() },
  });
  if (error) return { ok: false, error: describeAuthError(error) };
  // With email confirmation on, Supabase hides existing accounts behind a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, error: 'An account with this email already exists. Sign in instead.' };
  }
  if (!data.session) {
    return { ok: true, notice: 'Check your inbox for a confirmation link, then sign in here.' };
  }
  return { ok: true };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) return unavailable();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl() });
  if (error) return { ok: false, error: describeAuthError(error) };
  return { ok: true, notice: 'If an account exists for that email, a reset link is on its way.' };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  if (!supabase) return unavailable();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: describeAuthError(error) };
  setAuth({ recovering: false });
  return { ok: true, notice: 'Password updated.' };
}

export function dismissLinkError() {
  setAuth({ linkError: null });
}

function clearDevice() {
  applyLocal({});
  applyProfile(null);
  useSimulationStore.getState().exit();
  useSyncStore.setState({ ownerId: null, pending: [], lastSyncedAt: null });
}

export type SignOutResult = { ok: true } | { ok: false; error: string; unsynced: number };

/**
 * Upload anything outstanding, end the session on this device, and clear the device copy
 * (the account keeps it). If the upload fails, nothing is cleared unless `discardUnsynced`.
 */
export async function signOut(discardUnsynced = false): Promise<SignOutResult> {
  if (!supabase) return { ok: true };
  const unsynced = useSyncStore.getState().pending.length;
  if (unsynced > 0 && !discardUnsynced && !(await syncNow())) {
    return { ok: false, error: 'Your latest runs haven’t been uploaded yet.', unsynced };
  }
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) return { ok: false, error: describeAuthError(error), unsynced: 0 };
  clearDevice();
  return { ok: true };
}

/** Permanently delete the account, its progress and profile (server function in the migration). */
export async function deleteAccount(): Promise<AuthResult> {
  if (!supabase) return unavailable();
  const { error } = await supabase.rpc('delete_own_account');
  if (error) return { ok: false, error: describeAuthError(error) };
  // The user no longer exists, so this only clears the local session.
  await supabase.auth.signOut({ scope: 'local' });
  clearDevice();
  return { ok: true, notice: 'Your account and its synced progress were deleted.' };
}
