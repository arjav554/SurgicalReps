import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { orderReadings, readingGroup, referenceRangeFor, type ReadingGroup } from '@/data/referenceRanges';
import { cue } from '@/lib/feedback';
import { useSimulationStore } from '@/store/useSimulationStore';
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

const GROUP_TITLES: Record<ReadingGroup, string> = {
  vital: 'Vital signs',
  observation: 'Observations',
  lab: 'Labs',
};

/**
 * The readings at this point in the case, set as a plain flowsheet: vital signs first, then observations and
 * monitoring, then labs, in a fixed order. Each shows label, value, unit and any note, with a written flag for
 * anything abnormal. Nothing here moves. Hovering (or tapping) a reading that has a sourced reference range
 * shows it; readings without one show nothing rather than a placeholder.
 */
export function VitalsStrip({ vitals }: { vitals: Vital[] }) {
  const procedureId = useSimulationStore((s) => s.procedure?.id) ?? '';
  const [focus, setFocus] = useState<string | null>(null);

  const ordered = orderReadings(vitals);
  const groups = (['vital', 'observation', 'lab'] as const)
    .map((group) => ({ group, readings: ordered.filter((v) => readingGroup(v.label) === group) }))
    .filter((g) => g.readings.length > 0);
  const rangeOf = (label: string) => referenceRangeFor(procedureId, label);
  const anyRange = ordered.some((v) => rangeOf(v.label) !== undefined);
  const focusedRange = focus ? rangeOf(focus) : undefined;
  const hint = Platform.OS === 'web' ? 'Hover a reading for its reference range' : 'Tap a reading for its reference range';

  return (
    <View className="gap-3">
      {groups.map(({ group, readings }) => (
        <View key={group} className="gap-1.5">
          {groups.length > 1 && (
            <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">{GROUP_TITLES[group]}</Text>
          )}
          <View className="flex-row flex-wrap gap-2" accessibilityRole="summary">
            {readings.map((vital) => (
              <VitalTile
                key={vital.label}
                vital={vital}
                hasRange={rangeOf(vital.label) !== undefined}
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
        </View>
      ))}
      {anyRange && (
        <View className="min-h-[18px] flex-row items-center gap-1.5">
          <Icon name={focusedRange ? 'information-outline' : 'gesture-tap'} size={12} color={palette.inkFaint} />
          <Text className="font-data text-[11px] text-ink-faint">
            {focus && focusedRange ? (
              <>
                <Text className="font-data-medium text-[11px] text-ink-muted">{focus}</Text> · typical adult {focusedRange}
              </>
            ) : (
              hint
            )}
          </Text>
        </View>
      )}
    </View>
  );
}

function VitalTile({
  vital,
  hasRange,
  active,
  onFocus,
  onBlur,
  onToggle,
}: {
  vital: Vital;
  hasRange: boolean;
  active: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onToggle: () => void;
}) {
  const status = vital.status ?? 'normal';
  const flag = flagByStatus[status];
  const spoken = `${vital.label} ${vital.value}${vital.unit ? ` ${vital.unit}` : ''}${vital.note ? `, ${vital.note}` : ''}${
    flag ? `, ${flag.toLowerCase()}` : ''
  }`;

  const body = (
    <>
      {/* Clinical labels keep their casing (SpO2, Hct, pH). */}
      <Text className="font-data text-[10px] tracking-[1px] text-ink-faint">{vital.label}</Text>
      <Text className={`font-data-semibold text-[17px] leading-6 ${valueByStatus[status]}`}>
        {vital.value}
        {vital.unit && <Text className="font-data text-[10px] text-ink-faint"> {vital.unit}</Text>}
      </Text>
      {vital.note && <Text className="max-w-[150px] font-data text-[10px] leading-[14px] text-ink-muted">{vital.note}</Text>}
      {flag && (
        <Text className={`font-data-medium text-[9px] uppercase tracking-[1.2px] ${status === 'critical' ? 'text-alarm' : 'text-ink-muted'}`}>
          {flag}
        </Text>
      )}
    </>
  );
  const className = `min-w-[78px] rounded border px-2.5 pb-1.5 pt-1 ${tileByStatus[status]}`;

  if (!hasRange) {
    return (
      <View accessible accessibilityLabel={spoken} className={className}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      onHoverIn={onFocus}
      onHoverOut={onBlur}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`${spoken}. Show reference range.`}
      className={className}
      style={active ? { borderColor: palette.ink } : undefined}
    >
      {body}
    </Pressable>
  );
}
