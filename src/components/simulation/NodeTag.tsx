import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { palette, type IconName } from '@/theme';

type Tone = 'signal' | 'vital' | 'alarm' | 'muted';

const toneColor: Record<Tone, string> = {
  signal: palette.signal,
  vital: palette.vital,
  alarm: palette.alarm,
  muted: palette.inkMuted,
};

const toneText: Record<Tone, string> = {
  signal: 'text-signal',
  vital: 'text-vital',
  alarm: 'text-alarm',
  muted: 'text-ink-muted',
};

/** Monospace section label with an icon, e.g. "⌥ DECISION POINT". */
export function NodeTag({ label, tone, icon }: { label: string; tone: Tone; icon?: IconName }) {
  return (
    <View className="flex-row items-center gap-2">
      {icon ? (
        <Icon name={icon} size={14} color={toneColor[tone]} />
      ) : (
        <View className="h-1.5 w-1.5" style={{ backgroundColor: toneColor[tone] }} />
      )}
      <Text className={`font-data-medium text-[11px] uppercase tracking-[2px] ${toneText[tone]}`}>{label}</Text>
    </View>
  );
}
