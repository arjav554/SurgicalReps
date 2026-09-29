import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { specialtyChoice, trainingStage } from '@/data/specialties';
import {
  deleteAccount,
  dismissLinkError,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  syncNow,
  updatePassword,
  type AuthResult,
} from '@/lib/account';
import { emailProblem, passwordProblem } from '@/lib/authMessages';
import { formatAgo } from '@/lib/formatDuration';
import { useBreakpoint } from '@/lib/layout';
import { goBack } from '@/lib/navigation';
import { totalRuns } from '@/lib/progressMerge';
import { useAuthStore, useSyncStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useProgressStore } from '@/store/useProgressStore';
import { palette } from '@/theme';

type Mode = 'signIn' | 'signUp' | 'reset';

/** Optional account: sign in to back up progress and carry it between devices. */
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useBreakpoint();
  const wide = width >= 900;
  const status = useAuthStore((s) => s.status);
  const recovering = useAuthStore((s) => s.recovering);
  const userId = useAuthStore((s) => s.userId);
  const profileChecked = useAuthStore((s) => s.profileChecked);
  const profile = useProfileStore((s) => s.profile);
  const skippedFor = useProfileStore((s) => s.skippedFor);
  // Only a sign-in that happens while this screen is open (or an email link landing here) leads to the quiz.
  const [signedInOnArrival] = useState(status === 'signedIn');

  useEffect(() => {
    if (signedInOnArrival || status !== 'signedIn' || recovering || !profileChecked) return;
    if (profile || skippedFor === userId) return;
    router.replace({ pathname: '/onboarding', params: { from: 'signin' } });
  }, [signedInOnArrival, status, recovering, profileChecked, profile, skippedFor, userId]);

  const body =
    status === 'unavailable' ? (
      <Unavailable />
    ) : status === 'loading' ? (
      <Text className="font-data text-[12px] text-ink-faint">Checking your session…</Text>
    ) : recovering ? (
      <NewPasswordForm />
    ) : status === 'signedIn' ? (
      <AccountPanel />
    ) : (
      <AuthForm />
    );

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          width: '100%',
          maxWidth: 1100,
          alignSelf: 'center',
          paddingHorizontal: wide ? 40 : 20,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 48,
        }}
      >
        <View className="mb-10 flex-row items-center gap-4 border-b border-line pb-4">
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Back to the library"
            hitSlop={12}
            onPress={() => goBack('/')}
            className="h-9 flex-row items-center gap-1.5 rounded-sm border border-line pl-1.5 pr-3"
          >
            <Icon name="chevron-left" size={18} color={palette.inkMuted} />
            <Text className="font-ui-medium text-[13px] text-ink-muted">Library</Text>
          </PressableScale>
          <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-ink-faint">Account</Text>
        </View>

        <View className={wide ? 'flex-row items-start' : 'gap-10'} style={wide ? { gap: 72 } : undefined}>
          <View style={wide ? { width: 400 } : undefined} className="gap-5">
            <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">Optional</Text>
            <Text className="font-headline text-[42px] leading-[46px] text-ink lg:text-[56px] lg:leading-[58px]">
              Keep your reps.
            </Text>
            <Text className="font-display text-[17px] leading-[27px] text-ink-muted">
              Everything works without an account. Sign in to back up your progress and your specialty profile, and pick up
              where you left off on any device.
            </Text>
            <View className="border-t border-line">
              {[
                ['Progress', 'Runs, streaks, mastery and best times'],
                ['Profile', 'Training stage and specialty, for recommendations'],
                ['Privacy', 'Only you can read your records'],
              ].map(([term, detail]) => (
                <View key={term} className="flex-row gap-4 border-b border-line py-3">
                  <Text className="w-20 font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">{term}</Text>
                  <Text className="flex-1 text-[13px] leading-5 text-ink-muted">{detail}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-1" style={{ maxWidth: 520 }}>
            <LinkErrorNotice />
            {body}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LinkErrorNotice() {
  const linkError = useAuthStore((s) => s.linkError);
  if (!linkError) return null;
  return (
    <Notice tone="error" onDismiss={dismissLinkError}>
      {linkError}
    </Notice>
  );
}

function Notice({ tone, children, onDismiss }: { tone: 'error' | 'info'; children: ReactNode; onDismiss?: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <View
        className={`mb-5 flex-row items-start gap-3 border-l-2 py-3 pl-4 pr-3 ${
          tone === 'error' ? 'border-alarm bg-alarm-dim' : 'border-ink-muted bg-surface'
        }`}
      >
        <Text className={`flex-1 text-[14px] leading-[21px] ${tone === 'error' ? 'text-ink' : 'text-ink-muted'}`}>
          {children}
        </Text>
        {onDismiss && (
          <PressableScale accessibilityRole="button" accessibilityLabel="Dismiss" cue="tick" tint={false} onPress={onDismiss}>
            <Icon name="close" size={15} color={palette.inkFaint} />
          </PressableScale>
        )}
      </View>
    </Animated.View>
  );
}

/** Text tabs with an accent underline, as in the library. */
function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const tabs: { key: Mode; label: string }[] = [
    { key: 'signIn', label: 'Sign in' },
    { key: 'signUp', label: 'Create account' },
  ];
  return (
    <View className="mb-6 flex-row gap-x-6 border-b border-line">
      {tabs.map((tab) => {
        const active = tab.key === mode || (tab.key === 'signIn' && mode === 'reset');
        return (
          <PressableScale
            key={tab.key}
            accessibilityRole="tab"
            aria-selected={active}
            cue="tick"
            tint={false}
            onPress={() => onChange(tab.key)}
            className="pt-1"
          >
            <Text className={`text-[15px] ${active ? 'font-ui-semibold text-ink' : 'font-ui text-ink-muted'}`}>{tab.label}</Text>
            <View className="mt-2.5 h-[2px]" style={{ backgroundColor: active ? palette.accent : 'transparent' }} />
          </PressableScale>
        );
      })}
    </View>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const runs = useProgressStore((s) => totalRuns(s.byProcedure));
  const hasProfile = useProfileStore((s) => s.profile !== null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setFieldErrors({});
    setResult(null);
  };

  const submit = async () => {
    if (busy) return;
    const emailError = emailProblem(email);
    const passwordError = mode === 'reset' ? null : passwordProblem(password, mode === 'signUp');
    setFieldErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;
    setBusy(true);
    setResult(null);
    const outcome =
      mode === 'signIn'
        ? await signIn(email, password)
        : mode === 'signUp'
          ? await signUp(email, password)
          : await sendPasswordReset(email);
    setBusy(false);
    setResult(outcome);
    if (outcome.ok && outcome.notice && mode === 'signUp') {
      setMode('signIn');
      setPassword('');
    }
  };

  const guestData = [runs > 0 ? `${runs} run${runs === 1 ? '' : 's'}` : null, hasProfile ? 'your specialty profile' : null]
    .filter(Boolean)
    .join(' and ');

  return (
    <View>
      <ModeTabs mode={mode} onChange={switchMode} />
      {result && !result.ok && <Notice tone="error">{result.error}</Notice>}
      {result?.ok && result.notice && <Notice tone="info">{result.notice}</Notice>}

      {mode === 'reset' && (
        <View className="mb-5 gap-1.5">
          <Text className="font-display-bold text-[20px] text-ink">Reset your password</Text>
          <Text className="text-[14px] leading-[21px] text-ink-muted">We’ll email you a link to choose a new one.</Text>
        </View>
      )}

      <View className="gap-4">
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          placeholder="you@hospital.org"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType={mode === 'reset' ? 'send' : 'next'}
          onSubmitEditing={mode === 'reset' ? submit : undefined}
        />
        {mode !== 'reset' && (
          <TextField
            label="Password"
            secret
            value={password}
            onChangeText={setPassword}
            error={fieldErrors.password}
            placeholder={mode === 'signUp' ? 'At least 8 characters' : undefined}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={submit}
          />
        )}
      </View>

      {guestData && mode !== 'reset' && (
        <Text className="mt-4 text-[13px] leading-5 text-ink-muted">
          {`The ${guestData} on this device will be added to your account.`}
        </Text>
      )}

      <View className="mt-6 gap-4">
        <ActionButton
          label={
            busy
              ? 'One moment…'
              : mode === 'signIn'
                ? 'Sign in'
                : mode === 'signUp'
                  ? 'Create account'
                  : 'Send reset link'
          }
          icon={mode === 'reset' ? 'email-outline' : 'arrow-right'}
          disabled={busy}
          onPress={submit}
        />
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          {mode === 'signIn' ? (
            <TextLink label="Forgot password?" onPress={() => switchMode('reset')} />
          ) : mode === 'reset' ? (
            <TextLink label="Back to sign in" onPress={() => switchMode('signIn')} />
          ) : (
            <View />
          )}
          <TextLink label="Continue without an account" onPress={() => goBack('/')} />
        </View>
      </View>
    </View>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="link" cue="tick" tint={false} onPress={onPress}>
      <Text className="font-ui text-[13px] text-ink-muted underline">{label}</Text>
    </PressableScale>
  );
}

function NewPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  const submit = async () => {
    const passwordError = passwordProblem(password, true);
    const confirmError = !passwordError && confirm !== password ? 'The passwords don’t match.' : null;
    setErrors({ password: passwordError, confirm: confirmError });
    if (passwordError || confirmError) return;
    setBusy(true);
    const outcome = await updatePassword(password);
    setBusy(false);
    setResult(outcome);
  };

  return (
    <View className="gap-4">
      <Text className="font-display-bold text-[22px] text-ink">Choose a new password</Text>
      {result && !result.ok && <Notice tone="error">{result.error}</Notice>}
      <TextField
        label="New password"
        secret
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm password"
        secret
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <View className="mt-2">
        <ActionButton label={busy ? 'Saving…' : 'Save password'} icon="lock-outline" disabled={busy} onPress={submit} />
      </View>
    </View>
  );
}

function AccountPanel() {
  const email = useAuthStore((s) => s.email);
  const sync = useAuthStore((s) => s.sync);
  const syncError = useAuthStore((s) => s.syncError);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
  const byProcedure = useProgressStore((s) => s.byProcedure);
  const profile = useProfileStore((s) => s.profile);
  const [signOutIssue, setSignOutIssue] = useState<{ error: string; unsynced: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<null | 'sync' | 'signOut' | 'delete'>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const syncLabel =
    sync === 'syncing'
      ? 'Syncing…'
      : sync === 'error'
        ? 'Not synced'
        : lastSyncedAt
          ? `Synced ${formatAgo(lastSyncedAt, Math.max(now, lastSyncedAt))}`
          : 'Waiting';

  const doSignOut = async (discard: boolean) => {
    setBusy('signOut');
    const outcome = await signOut(discard);
    setBusy(null);
    if (outcome.ok) {
      setSignOutIssue(null);
      goBack('/');
    } else setSignOutIssue({ error: outcome.error, unsynced: outcome.unsynced });
  };

  const doDelete = async () => {
    setBusy('delete');
    const outcome = await deleteAccount();
    setBusy(null);
    if (outcome.ok) goBack('/');
    else setDeleteError(outcome.error);
  };

  return (
    <View className="gap-7">
      <View className="gap-1.5">
        <Text className="font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">Signed in as</Text>
        <Text className="font-data-medium text-[18px] text-ink">{email ?? 'Your account'}</Text>
      </View>

      <View className="flex-row border-y border-line">
        <Ledger first label="Status" value={syncLabel} />
        <Ledger label="Procedures" value={String(Object.keys(byProcedure).length)} />
        <Ledger label="Runs" value={String(totalRuns(byProcedure))} />
      </View>
      {sync === 'error' && syncError && <Notice tone="error">{`${syncError} Your runs are kept on this device until it works.`}</Notice>}

      <View className="gap-2 border-b border-line pb-5">
        <Text className="font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">Specialty profile</Text>
        <View className="flex-row flex-wrap items-baseline justify-between gap-3">
          <Text className="font-display text-[18px] text-ink">
            {profile
              ? `${trainingStage(profile.stage).label} · ${specialtyChoice(profile.specialty).label}`
              : 'Not set yet'}
          </Text>
          <TextLink label={profile ? 'Retake the quiz' : 'Take the 1-minute quiz'} onPress={() => router.push('/onboarding')} />
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <ActionButton
              label={busy === 'sync' ? 'Syncing…' : 'Sync now'}
              icon="sync"
              variant="ghost"
              disabled={busy !== null}
              onPress={async () => {
                setBusy('sync');
                await syncNow();
                setBusy(null);
              }}
            />
          </View>
          <View className="flex-1">
            <ActionButton
              label={busy === 'signOut' ? 'Signing out…' : 'Sign out'}
              icon="logout"
              variant="ghost"
              disabled={busy !== null}
              onPress={() => doSignOut(false)}
            />
          </View>
        </View>
        <Text className="text-[13px] leading-5 text-ink-faint">
          Signing out removes your progress from this device. It stays in your account.
        </Text>
      </View>

      {signOutIssue && (
        <View>
          <Notice tone="error">
            {signOutIssue.unsynced > 0
              ? `${signOutIssue.error} ${signOutIssue.unsynced} procedure${signOutIssue.unsynced === 1 ? '' : 's'} would be lost if you sign out now.`
              : signOutIssue.error}
          </Notice>
          {signOutIssue.unsynced > 0 && (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <ActionButton label="Try again" variant="ghost" disabled={busy !== null} onPress={() => doSignOut(false)} />
              </View>
              <View className="flex-1">
                <ActionButton label="Sign out anyway" variant="danger" disabled={busy !== null} onPress={() => doSignOut(true)} />
              </View>
            </View>
          )}
        </View>
      )}

      <View className="gap-3 border-t border-line pt-5">
        {confirmDelete ? (
          <Animated.View entering={FadeIn.duration(180)}>
            <View className="gap-3">
              <Text className="text-[14px] leading-[21px] text-ink">
                Delete your account, synced progress and profile? This can’t be undone.
              </Text>
              {deleteError && <Text className="text-[13px] text-alarm">{deleteError}</Text>}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <ActionButton label="Cancel" variant="ghost" disabled={busy !== null} onPress={() => setConfirmDelete(false)} />
                </View>
                <View className="flex-1">
                  <ActionButton
                    label={busy === 'delete' ? 'Deleting…' : 'Delete permanently'}
                    variant="danger"
                    disabled={busy !== null}
                    onPress={doDelete}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <PressableScale accessibilityRole="button" cue="tick" tint={false} onPress={() => setConfirmDelete(true)}>
            <Text className="font-ui text-[13px] text-alarm underline">Delete account</Text>
          </PressableScale>
        )}
      </View>
    </View>
  );
}

function Ledger({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <View className={`flex-1 gap-1 py-3 ${first ? 'pr-3' : 'border-l border-line px-3'}`}>
      <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">{label}</Text>
      <Text numberOfLines={1} className="font-data-medium text-[14px] text-ink">
        {value}
      </Text>
    </View>
  );
}

function Unavailable() {
  return (
    <View className="gap-5">
      <Text className="font-display-bold text-[22px] leading-[29px] text-ink">Accounts aren’t switched on in this build</Text>
      <Text className="text-[15px] leading-[24px] text-ink-muted">
        Your progress is saved on this device, and the specialty quiz works without an account. To turn on sign-in, connect a
        Supabase project: see docs/ACCOUNTS.md.
      </Text>
      <View className="border-y border-line py-3">
        {['Add the project URL and publishable key to .env.local', 'Run the SQL in supabase/migrations', 'Restart the dev server'].map(
          (step, i) => (
            <View key={step} className="flex-row gap-3 py-1.5">
              <Text className="w-6 font-data-medium text-[12px] text-signal">{String(i + 1).padStart(2, '0')}</Text>
              <Text className="flex-1 text-[14px] leading-[21px] text-ink">{step}</Text>
            </View>
          ),
        )}
      </View>
      <ActionButton label="Tailor to your specialty" icon="tune-variant" variant="ghost" onPress={() => router.push('/onboarding')} />
    </View>
  );
}
