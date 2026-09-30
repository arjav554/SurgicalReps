import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { CaseProgress } from '@/components/simulation/CaseProgress';
import { MonitorPanel } from '@/components/simulation/MonitorPanel';
import { ComplicationOverlay } from '@/components/simulation/ComplicationOverlay';
import { NodeRenderer } from '@/components/simulation/NodeRenderer';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { getProcedure } from '@/data/procedures';
import { primarySpecialtyLabel } from '@/data/specialties';
import { remainingSteps } from '@/lib/caseShape';
import { useBreakpoint } from '@/lib/layout';
import { goBack } from '@/lib/navigation';
import { useCurrentNode, useMonitorVitals, useSimulationStore } from '@/store/useSimulationStore';
import { palette, styleForCategory } from '@/theme';

export default function SimulationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const procedure = getProcedure(id);
  const insets = useSafeAreaInsets();

  const start = useSimulationStore((s) => s.start);
  const exit = useSimulationStore((s) => s.exit);
  const restart = useSimulationStore((s) => s.restart);
  const loadedId = useSimulationStore((s) => s.procedure?.id);
  const attempt = useSimulationStore((s) => s.attempt);
  const currentNodeId = useSimulationStore((s) => s.currentNodeId);
  const status = useSimulationStore((s) => s.status);
  const step = useSimulationStore((s) => s.path.length);
  const visibleStep = useSimulationStore(
    (s) => s.path.filter((nodeId) => s.procedure?.nodes[nodeId]?.type !== 'chance').length,
  );
  const complication = useSimulationStore((s) => s.complication);
  const node = useCurrentNode();
  const monitor = useMonitorVitals();
  const { width } = useBreakpoint();
  // Desktop workstation: monitor + timeline beside a focused question panel.
  const wide = width >= 1000;

  useEffect(() => {
    if (!procedure) return;
    // A page refresh rehydrates the run in progress; resume it only if it is this very case.
    if (useSimulationStore.getState().procedure?.id !== procedure.id) start(procedure);
    return exit;
  }, [procedure, start, exit]);

  if (!procedure) {
    return (
      <View
        className="flex-1 justify-between bg-canvas px-5"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }}
      >
        <Text className="font-data text-sm text-ink-muted">{id}</Text>
        <ActionButton label="Back" variant="ghost" icon="chevron-left" onPress={() => goBack('/')} />
      </View>
    );
  }

  const ready = loadedId === procedure.id && node && currentNodeId !== null;
  const done = Math.max(0, visibleStep - 1);
  const ahead = ready ? remainingSteps(procedure, currentNodeId) : 1;
  const progress = status === 'running' ? done / (done + ahead) : 1;
  const category = styleForCategory(procedure.category);

  return (
    <View className="flex-1 bg-canvas">
      {/* No swipe-back while a complication is on screen: restarting is mandatory. */}
      <Stack.Screen options={{ gestureEnabled: !complication }} />

      <View
        className="w-full flex-1 self-center px-5 lg:px-8"
        style={{ maxWidth: 1240, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }}
        aria-hidden={!!complication}
        importantForAccessibility={complication ? 'no-hide-descendants' : 'auto'}
      >
        <View className="mb-5 gap-3">
          <View className="flex-row items-center gap-3">
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Exit simulation"
              hitSlop={12}
              onPress={() => goBack({ pathname: '/procedure/[id]', params: { id: procedure.id } })}
              className="h-10 w-10 items-center justify-center rounded-sm border border-line bg-surface"
            >
              <Icon name="close" size={18} color={palette.inkMuted} />
            </PressableScale>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Icon name={category.icon} size={11} color={category.color} />
                <Text numberOfLines={1} className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">
                  {primarySpecialtyLabel(procedure.id)}
                </Text>
              </View>
              <Text numberOfLines={1} className="font-ui-semibold text-[15px] text-ink">
                {procedure.title}
              </Text>
            </View>
            <ElapsedClock />
          </View>
          <CaseProgress progress={progress} failed={status === 'failure'} />
        </View>

        {ready &&
          (wide ? (
            <View className="flex-1 flex-row gap-6">
              <View style={{ width: 340 }}>
                <MonitorPanel procedure={procedure} vitals={monitor} />
              </View>
              <View className="flex-1" style={{ maxWidth: 820 }}>
                <NodeRenderer
                  key={`${attempt}:${step}`}
                  procedure={procedure}
                  nodeId={currentNodeId}
                  node={node}
                  showMonitor={false}
                />
              </View>
            </View>
          ) : (
            <NodeRenderer key={`${attempt}:${step}`} procedure={procedure} nodeId={currentNodeId} node={node} />
          ))}
      </View>

      {ready && complication && (
        <ComplicationOverlay
          key={attempt}
          complication={complication}
          outcome={procedure.nodes[complication.outcomeNodeId]}
          references={procedure.references}
          onRestart={restart}
        />
      )}
    </View>
  );
}

/** Running m:ss since the attempt began; freezes when the attempt ends. */
function ElapsedClock() {
  const startedAt = useSimulationStore((s) => s.startedAt);
  const finishedAt = useSimulationStore((s) => s.finishedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (finishedAt !== null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [finishedAt, startedAt]);

  if (startedAt === null) return null;
  const seconds = Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 1000));
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-sm border border-line bg-surface px-2.5 py-2"
      accessibilityLabel="Elapsed time"
    >
      <Icon name="timer-outline" size={14} color={palette.inkFaint} />
      <Text className="font-data-medium text-[13px] text-ink-muted">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
      </Text>
    </View>
  );
}
