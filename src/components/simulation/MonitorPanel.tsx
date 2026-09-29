import { useEffect } from 'react';
import { Image, ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { figureFor } from '@/data/figures';
import { KEYBOARD } from '@/lib/keyboard';
import { useSimulationStore } from '@/store/useSimulationStore';
import { palette, type IconName } from '@/theme';
import type { Procedure, Vital } from '@/types/procedure';

import { VitalsStrip } from './VitalsStrip';

/** Desktop workstation side panel: the live patient monitor and the case timeline. */
export function MonitorPanel({ procedure, vitals }: { procedure: Procedure; vitals: Vital[] | undefined }) {
  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 pb-4">
      <View className="gap-3 rounded border border-line bg-surface p-4">
        <PanelLabel icon="monitor-dashboard" label="Patient monitor" live />
        {vitals ? (
          <VitalsStrip vitals={vitals} />
        ) : (
          <Text className="text-[13px] leading-5 text-ink-faint">No readings for this case yet.</Text>
        )}
      </View>

      <View className="gap-3 rounded border border-line bg-surface p-4">
        <PanelLabel icon="chart-timeline-variant" label="Case timeline" />
        <Timeline procedure={procedure} />
      </View>

      <AnatomyCard procedureId={procedure.id} />

      {KEYBOARD && (
        <View className="gap-2 rounded border border-line bg-surface/60 p-4">
          <PanelLabel icon="keyboard-outline" label="Shortcuts" />
          <Shortcut keys="A – D" action="Answer" />
          <Shortcut keys="Enter" action="Continue · confirm" />
          <Shortcut keys="R" action="Restart after the case" />
        </View>
      )}
    </ScrollView>
  );
}

function PanelLabel({ icon, label, live = false }: { icon: IconName; label: string; live?: boolean }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Icon name={icon} size={15} color={palette.inkFaint} />
        <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-ink-faint">{label}</Text>
      </View>
      {live && <LiveBadge />}
    </View>
  );
}

function LiveBadge() {
  const blink = useSharedValue(1);
  useEffect(() => {
    blink.set(withRepeat(withTiming(0.25, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [blink]);
  const style = useAnimatedStyle(() => ({ opacity: blink.value }));
  return (
    <View className="flex-row items-center gap-1.5">
      <Animated.View style={[{ width: 6, height: 6, borderRadius: 1, backgroundColor: palette.vital }, style]} />
      <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-vital">Live</Text>
    </View>
  );
}

function Timeline({ procedure }: { procedure: Procedure }) {
  const path = useSimulationStore((s) => s.path);
  const choices = useSimulationStore((s) => s.choices);
  const status = useSimulationStore((s) => s.status);

  const steps = path
    .map((nodeId, index) => ({ nodeId, node: procedure.nodes[nodeId], index }))
    .filter((s) => s.node && s.node.type !== 'chance');

  return (
    <View className="gap-0">
      {steps.map(({ nodeId, node, index }, i) => {
        if (!node || node.type === 'chance') return null;
        const current = i === steps.length - 1;
        const choice = choices.find((c) => c.nodeId === nodeId);
        const kind =
          node.type === 'terminal'
            ? node.status === 'success'
              ? 'done'
              : 'failed'
            : choice
              ? choice.isCorrect
                ? 'right'
                : 'wrong'
              : current && status === 'running'
                ? 'current'
                : 'seen';
        const label =
          node.type === 'info'
            ? 'Clinical update'
            : node.type === 'terminal'
              ? node.status === 'success'
                ? 'Case complete'
                : 'Complication'
              : node.text;
        return (
          <Animated.View key={`${index}:${nodeId}`} entering={FadeInLeft.duration(280)}>
            <View className="flex-row gap-3">
              <View className="items-center">
                <TimelineDot kind={kind} />
                {i < steps.length - 1 && <View className="w-px flex-1 bg-line" />}
              </View>
              {/* Padding sits outside the clamped text so a third line can't show through on web. */}
              <View className="flex-1 pb-3">
                <Text
                  numberOfLines={2}
                  className={`text-[12px] leading-[18px] ${current ? 'font-ui-medium text-ink' : 'text-ink-muted'}`}
                >
                  {label}
                </Text>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

type DotKind = 'current' | 'seen' | 'right' | 'wrong' | 'done' | 'failed';

function TimelineDot({ kind }: { kind: DotKind }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (kind !== 'current') return;
    pulse.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1));
  }, [kind, pulse]);
  const ring = useAnimatedStyle(() => ({ opacity: 1 - pulse.value, transform: [{ scale: 1 + pulse.value * 1.6 }] }));

  const color =
    kind === 'right' || kind === 'done'
      ? palette.vital
      : kind === 'wrong' || kind === 'failed'
        ? palette.alarm
        : kind === 'current'
          ? palette.signal
          : palette.inkFaint;
  const icon: IconName | null = kind === 'right' || kind === 'done' ? 'check' : kind === 'wrong' || kind === 'failed' ? 'close' : null;

  return (
    <View style={{ width: 18, height: 18 }} className="items-center justify-center">
      {kind === 'current' && (
        <Animated.View
          style={[{ position: 'absolute', width: 10, height: 10, borderRadius: 1, backgroundColor: color }, ring]}
        />
      )}
      {icon ? (
        <View className="h-[18px] w-[18px] items-center justify-center rounded-sm border" style={{ borderColor: `${color}66` }}>
          <Icon name={icon} size={12} color={color} />
        </View>
      ) : (
        <View style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: color }} />
      )}
    </View>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[12px] text-ink-muted">{action}</Text>
      <View className="rounded-md border border-line-strong bg-surface-raised px-1.5 py-0.5">
        <Text className="font-data text-[10px] text-ink-muted">{keys}</Text>
      </View>
    </View>
  );
}

/** The procedure's atlas plate as a compact reference while the case runs. */
function AnatomyCard({ procedureId }: { procedureId: string }) {
  const figure = figureFor(procedureId);
  if (!figure) return null;
  return (
    <View className="overflow-hidden rounded border border-line bg-paper">
      <Image source={figure.plate} resizeMode="contain" style={{ width: '100%', height: 170 }} accessibilityLabel={figure.caption} />
      <View className="flex-row items-baseline gap-2 border-t border-paper-ink/10 px-3 py-2">
        <Text className="font-data-semibold text-[10px] uppercase tracking-[1.5px] text-paper-muted">{figure.label}</Text>
        <Text numberOfLines={1} className="flex-1 font-display-italic text-[12px] text-paper-ink">
          {figure.caption}
        </Text>
      </View>
    </View>
  );
}
