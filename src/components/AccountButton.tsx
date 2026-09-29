import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useAuthStore } from '@/store/useAuthStore';
import { palette } from '@/theme';

/** Masthead entry to the optional account: "Sign in" as a guest, a sync marker once signed in. */
export function AccountButton() {
  const status = useAuthStore((s) => s.status);
  const sync = useAuthStore((s) => s.sync);
  const signedIn = status === 'signedIn';
  const label = signedIn ? (sync === 'error' ? 'Not synced' : sync === 'syncing' ? 'Syncing' : 'Account') : 'Sign in';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={signedIn ? `Account, ${label}` : 'Sign in to save progress'}
      onPress={() => router.push('/account')}
      className="h-9 flex-row items-center gap-2 rounded-sm border border-line px-2.5"
    >
      <Icon name={signedIn ? 'account-check-outline' : 'account-outline'} size={16} color={palette.ink} />
      <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-muted">{label}</Text>
      {signedIn && (
        <View
          className="h-1.5 w-1.5"
          style={{ backgroundColor: sync === 'error' ? palette.accent : sync === 'synced' ? palette.ink : palette.inkFaint }}
        />
      )}
    </PressableScale>
  );
}
