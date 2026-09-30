import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import type { Cue } from '@/lib/feedback';
import { palette, type IconName } from '@/theme';

type Variant = 'primary' | 'danger' | 'ghost' | 'bracket';

/** Primary is bone on ink; bracket is an outline with gold corner ticks; red is reserved for danger. */
const containerByVariant: Record<Variant, string> = {
  primary: 'bg-ink',
  danger: 'bg-alarm',
  ghost: 'border border-field bg-transparent',
  bracket: 'border border-line-strong bg-transparent',
};

const labelByVariant: Record<Variant, string> = {
  primary: 'text-canvas',
  danger: 'text-canvas',
  ghost: 'text-ink',
  bracket: 'text-ink',
};

const iconColor: Record<Variant, string> = {
  primary: palette.canvas,
  danger: palette.canvas,
  ghost: palette.ink,
  bracket: palette.ink,
};

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: IconName;
  cue?: Cue | null;
  /** Keyboard hint shown on large screens, e.g. "Enter". */
  shortcut?: string;
}

export function ActionButton({ label, onPress, variant = 'primary', disabled, icon, cue = 'tap', shortcut }: ActionButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      aria-disabled={!!disabled}
      disabled={disabled}
      onPress={onPress}
      cue={disabled ? null : cue}
      className={`min-h-[52px] flex-row items-center justify-center gap-2.5 overflow-hidden rounded px-6 ${containerByVariant[variant]} ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {icon && (
        <View>
          <Icon name={icon} size={18} color={iconColor[variant]} />
        </View>
      )}
      <Text className={`font-ui-semibold text-[15px] tracking-[0.3px] ${labelByVariant[variant]}`}>{label}</Text>
      {variant === 'bracket' && <Corners />}
      {shortcut && (
        <View className="ml-1 hidden rounded-sm border px-1.5 py-0.5 lg:flex" style={{ borderColor: iconColor[variant], opacity: 0.45 }}>
          <Text className={`font-data text-[10px] ${labelByVariant[variant]}`}>{shortcut}</Text>
        </View>
      )}
    </PressableScale>
  );
}

/** Gold ticks on the four corners, the way the archive reference brackets its share button. */
function Corners() {
  const tick = { position: 'absolute', width: 7, height: 7, borderColor: palette.accent } as const;
  return (
    <>
      <View pointerEvents="none" style={[tick, { top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 }]} />
      <View pointerEvents="none" style={[tick, { top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 }]} />
      <View pointerEvents="none" style={[tick, { bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
      <View pointerEvents="none" style={[tick, { bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 }]} />
    </>
  );
}
