import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

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

/** Words, not just colour or a marker: the flag a case gives a reading, spoken as well as seen. */
const flagByStatus: Record<VitalStatus, string | null> = {
  normal: null,
  warning: 'Abnormal',
  critical: 'Critical',
};

/**
 * The readings at this point in the case, set as a plain flowsheet: label, value, unit, and a written flag for
 * anything abnormal. Nothing here moves. Hovering (or tapping) a reading shows its reference range.
 */
export function VitalsStrip({ vitals }: { vitals: Vital[] }) {
  const [focus, setFocus] = useState<string | null>(null);
  const focused = vitals.find((v) => v.label === focus);
  const hint = Platform.OS === 'web' ? 'Hover a reading for its reference range' : 'Tap a reading for its reference range';

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-2" accessibilityRole="summary">
        {vitals.map((vital) => (
          <VitalTile
            key={vital.label}
            vital={vital}
            active={focus === vital.label}
            onFocus={() => setFocus(vital.label)}
            onBlur={() => setFocus((f) => (f === vital.label ? null : f))}
            onToggle={() => {
              cue('tick');
              setFocus((f) => (f === vital.label ? null : vital.label));
            }}
          />
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
  const flag = flagByStatus[status];

  return (
    <Pressable
      onHoverIn={onFocus}
      onHoverOut={onBlur}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${vital.label} ${vital.value}${vital.unit ? ` ${vital.unit}` : ''}${
        flag ? `, ${flag.toLowerCase()}` : ''
      }. Show reference range.`}
      className={`min-w-[78px] rounded border px-2.5 pb-1.5 pt-1 ${tileByStatus[status]}`}
      style={active ? { borderColor: palette.ink } : undefined}
    >
      {/* Clinical labels keep their casing (SpO2, Hct, pH). */}
      <Text className="font-data text-[10px] tracking-[1px] text-ink-faint">{vital.label}</Text>
      <Text className={`font-data-semibold text-[17px] leading-6 ${valueByStatus[status]}`}>
        {vital.value}
        {vital.unit && <Text className="font-data text-[10px] text-ink-faint"> {vital.unit}</Text>}
      </Text>
      {flag && (
        <Text className={`font-data-medium text-[9px] uppercase tracking-[1.2px] ${status === 'critical' ? 'text-alarm' : 'text-ink-muted'}`}>
          {flag}
        </Text>
      )}
    </Pressable>
  );
}
