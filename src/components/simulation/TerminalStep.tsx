import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ActionButton } from '@/components/ActionButton';
import { OutcomeMark } from '@/components/graphics/OutcomeMark';
import { ReferenceList, SourceLine } from '@/components/ReferenceLink';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { cue } from '@/lib/feedback';
import { formatDuration } from '@/lib/formatDuration';
import { useKeyShortcuts } from '@/lib/keyboard';
import { MASTERY_STREAK, useProcedureProgress } from '@/store/useProgressStore';
import type { ChoiceRecord } from '@/store/useSimulationStore';
import { palette, type IconName } from '@/theme';
import type { Procedure, TerminalNode } from '@/types/procedure';

import { NodeTag } from './NodeTag';
import { VitalsStrip } from './VitalsStrip';

interface TerminalStepProps {
  node: TerminalNode;
  procedure: Procedure;
  choices: ChoiceRecord[];
  durationMs: number | null;
  onRestart: () => void;
}

export function TerminalStep({ node, procedure, choices, durationMs, onRestart }: TerminalStepProps) {
  const succeeded = node.status === 'success';
  const progress = useProcedureProgress(procedure.id);
  const decisionMs = choices.reduce((sum, c) => sum + c.elapsedMs, 0);

  useEffect(() => {
    if (succeeded) cue('complete');
  }, [succeeded]);
  // Failures are handled by the complication overlay, which owns the restart keys then.
  useKeyShortcuts({ r: onRestart }, succeeded);
  const [expandAll, setExpandAll] = useState(false);

  const badges: { icon: IconName; label: string }[] = [];
  if (succeeded) {
    if (progress.successes === 1) badges.push({ icon: 'star-four-points', label: 'First clean run' });
    else if (durationMs !== null && progress.bestTimeMs === durationMs) {
      badges.push({ icon: 'timer-outline', label: 'Personal best' });
    }
    if (progress.currentStreak === MASTERY_STREAK) badges.push({ icon: 'medal-outline', label: 'Mastered' });
    else if (progress.currentStreak > 0) {
      badges.push({ icon: 'fire', label: `Streak ${progress.currentStreak}/${MASTERY_STREAK}` });
    }
  }

  return (
    <View className="flex-1 justify-between gap-5">
      <ScrollView className="flex-1" contentContainerClassName="gap-7 pb-2">
        <View className="gap-4">
          <View className="flex-row items-center gap-4">
            <OutcomeMark success={succeeded} />
            <NodeTag label={succeeded ? 'Case complete' : 'Case failed'} tone={succeeded ? 'vital' : 'alarm'} />
          </View>
          <Animated.View entering={FadeInDown.delay(250).duration(360)}>
            <Text className="font-headline text-[30px] leading-[38px] text-ink">{node.text}</Text>
          </Animated.View>
          {badges.length > 0 && (
            <Animated.View entering={FadeIn.delay(700).duration(400)}>
              <View className="flex-row flex-wrap gap-2">
              {badges.map((badge) => (
                <View key={badge.label} className="flex-row items-center gap-1.5 rounded-sm border border-line-strong px-2.5 py-1">
                  <Icon name={badge.icon} size={13} color={palette.accent} />
                  <Text className="font-data-medium text-[11px] uppercase tracking-[1.2px] text-ink">{badge.label}</Text>
                </View>
              ))}
              </View>
            </Animated.View>
          )}
          {node.vitals && <VitalsStrip vitals={node.vitals} />}
        </View>

        {choices.length > 0 && (
          <View className="flex-row border-y border-line">
            <Stat first label="Correct" value={`${choices.filter((c) => c.isCorrect).length}/${choices.length}`} />
            {durationMs !== null && <Stat label="Case time" value={formatDuration(durationMs)} />}
            <Stat label="Per call" value={formatDuration(decisionMs / choices.length)} />
          </View>
        )}

        {choices.length > 0 && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <SectionLabel icon="clipboard-check-outline" label="Case review" />
              <PressableScale accessibilityRole="button" cue="tick" onPress={() => setExpandAll((v) => !v)}>
                <Text className="font-data text-[11px] text-signal">{expandAll ? 'Collapse all' : 'Expand all'}</Text>
              </PressableScale>
            </View>
            {choices.map((choice, index) => (
              <Animated.View key={`${index}:${choice.nodeId}`} entering={FadeInDown.delay(300 + index * 70).duration(300)}>
                <ReviewItem choice={choice} procedure={procedure} forceOpen={expandAll} />
              </Animated.View>
            ))}
          </View>
        )}

        {procedure.references.length > 0 && (
          <View className="gap-4 border-t border-line pt-6">
            <SectionLabel icon="book-open-page-variant" label="Evidence" />
            <ReferenceList references={procedure.references} />
          </View>
        )}
      </ScrollView>

      <ActionButton
        label="Run it again"
        shortcut={succeeded ? 'R' : undefined}
        icon="restart"
        onPress={onRestart}
        variant={succeeded ? 'ghost' : 'primary'}
      />
    </View>
  );
}

function Stat({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <View className={`flex-1 py-2.5 ${first ? 'pr-3' : 'border-l border-line px-3'}`}>
      <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">{label}</Text>
      <Text className="font-data-semibold text-[17px] text-ink">{value}</Text>
    </View>
  );
}

export function SectionLabel({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size={15} color={palette.inkFaint} />
      <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-ink-faint">{label}</Text>
    </View>
  );
}

/** One call in the case review; tap to reveal the evidence rationale. */
function ReviewItem({ choice, procedure, forceOpen }: { choice: ChoiceRecord; procedure: Procedure; forceOpen: boolean }) {
  const [open, setOpen] = useState(!choice.isCorrect);
  const expanded = open || forceOpen;
  const rotate = useSharedValue(expanded ? 1 : 0);
  useEffect(() => {
    rotate.set(withTiming(expanded ? 1 : 0, { duration: 200 }));
  }, [expanded, rotate]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value * 180}deg` }] }));
  const decision = procedure.nodes[choice.nodeId];
  const rationale = choice.feedback;

  return (
    <PressableScale
      accessibilityRole="button"
      aria-expanded={expanded}
      cue={rationale ? 'tick' : null}
      depth={0.99}
      disabled={!rationale}
      onPress={() => setOpen((o) => !o)}
      rule
      className="gap-2 border-b border-line py-4 pl-3 pr-1"
    >
      <View className="flex-row items-start gap-3">
        <View
          className={`mt-[1px] h-6 w-6 items-center justify-center rounded-sm border ${
            choice.isCorrect ? 'border-line-strong' : 'border-alarm bg-alarm-dim'
          }`}
        >
          <Icon name={choice.isCorrect ? 'check' : 'close'} size={14} color={choice.isCorrect ? palette.ink : palette.alarm} />
        </View>
        <Text className="flex-1 text-[13px] leading-5 text-ink-muted">
          {decision && decision.type !== 'chance' ? decision.text : ''}
        </Text>
        <Text className="font-data text-[11px] text-ink-faint">{formatDuration(choice.elapsedMs)}</Text>
        {rationale && (
          <Animated.View style={chevron}>
            <Icon name="chevron-down" size={16} color={palette.inkFaint} />
          </Animated.View>
        )}
      </View>
      {choice.selected.map((s) => (
        <Text key={s.optionIndex} className="pl-9 font-ui-medium text-[15px] leading-[22px] text-ink">
          <Text className="font-data text-ink-faint">{s.letter} </Text>
          {s.label}
        </Text>
      ))}
      {expanded && rationale && (
        <Animated.View entering={FadeIn.duration(220)}>
          <View className="ml-9 mt-1 gap-2 border-l-2 border-signal pl-3">
            <Text className="text-[13px] leading-5 text-ink-muted">{rationale}</Text>
            <SourceLine references={procedure.references} cite={choice.cite} />
          </View>
        </Animated.View>
      )}
    </PressableScale>
  );
}
