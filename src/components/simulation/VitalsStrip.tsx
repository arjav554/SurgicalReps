import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { EcgTrace } from '@/components/graphics/EcgTrace';
import { Heartbeat } from '@/components/graphics/Heartbeat';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { REFERENCE_RANGE_FALLBACK, REFERENCE_RANGES } from '@/data/referenceRanges';
import { cue } from '@/lib/feedback';
import { palette } from '@/theme';
import type { Vital, VitalStatus } from '@/types/procedure';

const tileByStatus: Record<VitalStatus, string> = {
  normal: 'border-line bg-surface',
  warning: 'border-line-strong bg-surface-raised',
  critical: 'border-alarm/60 bg-alarm-dim',
};

const valueByStatus: Record<VitalStatus, string> = {
  normal: 'text-ink-muted',
  warning: 'text-ink',
  critical: 'text-alarm',
};

const colorByStatus: Record<VitalStatus, string> = {
  normal: palette.inkMuted,
  warning: palette.ink,
  critical: palette.alarm,
};

/** Status is carried by marker and weight, not hue: hollow square = abnormal, filled red = critical. */
function StatusMarker({ status }: { status: VitalStatus }) {
  if (status === 'normal') return null;
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 1,
        borderWidth: 1,
        borderColor: colorByStatus[status],
        backgroundColor: status === 'critical' ? palette.alarm : 'transparent',
      }}
    />
  );
}

/**
 * Bedside-monitor readout. Tiles fade in in sequence; critical values breathe;
 * HR carries a live heartbeat and waveform; hovering (or tapping) a reading
 * shows its typical adult reference range.
 */
export function VitalsStrip({ vitals }: { vitals: Vital[] }) {
  const [focus, setFocus] = useState<string | null>(null);
  const focused = vitals.find((v) => v.label === focus);
  const hint = Platform.OS === 'web' ? 'Hover a reading for its reference range' : 'Tap a reading for its reference range';

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-2" accessibilityRole="summary">
        {vitals.map((vital, index) => (
          <Animated.View key={vital.label} entering={FadeIn.delay(60 + index * 45).duration(260)}>
            <VitalTile
              vital={vital}
              active={focus === vital.label}
              onFocus={() => setFocus(vital.label)}
              onBlur={() => setFocus((f) => (f === vital.label ? null : f))}
              onToggle={() => {
                cue('tick');
                setFocus((f) => (f === vital.label ? null : vital.label));
              }}
            />
          </Animated.View>
        ))}
      </View>
      <View className="min-h-[18px] flex-row items-center gap-1.5">
        <Icon name={focused ? 'information-outline' : 'gesture-tap'} size={12} color={palette.inkFaint} />
        <Text className="font-data text-[11px] text-ink-faint">
          {focused ? (
            <>
              <Text className="font-data-medium text-[11px] text-ink-muted">{focused.label}</Text> ·{' '}
              {REFERENCE_RANGES[focused.label] ? `typical adult ${REFERENCE_RANGES[focused.label]}` : REFERENCE_RANGE_FALLBACK}
            </>
          ) : (
            hint
          )}
        </Text>
      </View>
    </View>
  );
}

function VitalTile({
  vital,
  active,
  onFocus,
  onBlur,
  onToggle,
}: {
  vital: Vital;
  active: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onToggle: () => void;
}) {
  const status = vital.status ?? 'normal';
  const isHeartRate = vital.label === 'HR';
  const bpm = Number.parseInt(vital.value, 10);
  const blink = useSharedValue(0);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (status !== 'critical') return;
    blink.set(withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })), -1));
  }, [status, blink]);

  useEffect(() => {
    lift.set(withTiming(active ? 1 : 0, { duration: 160 }));
  }, [active, lift]);

  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.value * 0.55 }));
  const liftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(lift.value, [0, 1], [0, -2]) }] }));

  return (
    <Animated.View style={liftStyle}>
      <Pressable
        onHoverIn={onFocus}
        onHoverOut={onBlur}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${vital.label} ${vital.value}${vital.unit ? ` ${vital.unit}` : ''}${
          status === 'normal' ? '' : `, ${status}`
        }. Show reference range.`}
        className={`min-w-[78px] rounded border px-2.5 pb-1.5 pt-1 ${tileByStatus[status]}`}
        style={active ? { borderColor: palette.ink } : undefined}
      >
        {status === 'critical' && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -1,
                right: -1,
                bottom: -1,
                left: -1,
                borderRadius: 3,
                borderWidth: 1,
                borderColor: palette.alarm,
                pointerEvents: 'none',
              },
              blinkStyle,
            ]}
          />
        )}
        <View className="flex-row items-center justify-between gap-2">
          {/* Clinical labels keep their casing (SpO2, Hct, pH). */}
          <View className="flex-row items-center gap-1.5">
            <StatusMarker status={status} />
            <Text className="font-data text-[10px] tracking-[1px] text-ink-faint">{vital.label}</Text>
          </View>
          {isHeartRate && <Heartbeat bpm={bpm} color={colorByStatus[status]} size={10} />}
        </View>
        <Text className={`font-data-semibold text-[17px] leading-6 ${valueByStatus[status]}`}>
          {vital.value}
          {vital.unit && <Text className="font-data text-[10px] text-ink-faint"> {vital.unit}</Text>}
        </Text>
        {isHeartRate && Number.isFinite(bpm) && (
          <View className="-mx-1 mt-0.5 opacity-80">
            <EcgTrace width={82} height={16} beats={2} color={colorByStatus[status]} period={(2 * 60000) / Math.max(30, bpm)} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
