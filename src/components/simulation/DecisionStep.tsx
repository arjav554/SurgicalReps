import { useEffect, useEffectEvent, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { PressableScale, useHover } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { cue } from '@/lib/feedback';
import { KEYBOARD, optionKeys, useKeyShortcuts } from '@/lib/keyboard';
import { letterFor } from '@/store/useSimulationStore';
import { palette } from '@/theme';
import type { DecisionNode, Vital } from '@/types/procedure';

import { NodeTag } from './NodeTag';
import { VitalsStrip } from './VitalsStrip';

/** How long the green/red confirmation shows before the case moves on. */
export const COMMIT_DELAY_MS = 420;

interface DecisionStepProps {
  node: DecisionNode;
  /** Current monitor readings (the node's own, or carried forward); omitted when a side monitor shows them. */
  vitals?: Vital[];
  /** Original option indices in the order they are shown this attempt. */
  order: number[];
  onChoose: (optionIndex: number) => void;
}

export function DecisionStep({ node, vitals, order, onChoose }: DecisionStepProps) {
  const [picked, setPicked] = useState<number | null>(null);

  // Hold the green/red confirmation briefly, then commit the call.
  const commit = useEffectEvent((optionIndex: number) => onChoose(optionIndex));
  useEffect(() => {
    if (picked === null) return;
    const id = setTimeout(() => commit(picked), COMMIT_DELAY_MS);
    return () => clearTimeout(id);
  }, [picked]);

  const pick = (optionIndex: number) => {
    if (picked !== null) return;
    const option = node.options[optionIndex];
    if (!option) return;
    setPicked(optionIndex);
    cue(option.isCorrect ? 'correct' : 'alarm');
  };

  useKeyShortcuts(
    optionKeys(order.length, (position) => {
      const optionIndex = order[position];
      if (optionIndex !== undefined) pick(optionIndex);
    }),
    picked === null,
  );

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-5 pb-4 lg:grow lg:justify-center lg:pb-16">
      <NodeTag label="Decision point" tone="signal" icon="source-branch" />
      {vitals && <VitalsStrip vitals={vitals} />}

      {/* One focused panel: the stem with its options directly beneath it. */}
      <View className="gap-5 rounded border border-line bg-surface/60 p-4 lg:p-6">
        <Animated.View entering={FadeInDown.delay(60).duration(320)}>
          <Text className="font-display text-[22px] leading-[31px] text-ink lg:text-[25px] lg:leading-[35px]">{node.text}</Text>
        </Animated.View>

        <View className="gap-2.5">
          {order.map((optionIndex, position) => {
            const option = node.options[optionIndex];
            if (!option) return null;
            const state = picked === optionIndex ? (option.isCorrect ? 'right' : 'wrong') : picked !== null ? 'dim' : 'idle';
            return (
              <Animated.View key={`${optionIndex}:${option.label}`} entering={FadeInDown.delay(140 + position * 70).duration(300)}>
                <OptionCard letter={letterFor(position)} label={option.label} state={state} onPress={() => pick(optionIndex)} />
              </Animated.View>
            );
          })}
        </View>

        {KEYBOARD && <ShortcutHint text={`Press ${letterFor(0)}–${letterFor(order.length - 1)} to answer`} />}
      </View>
    </ScrollView>
  );
}

export function ShortcutHint({ text }: { text: string }) {
  return (
    <View className="hidden flex-row items-center gap-1.5 lg:flex">
      <Icon name="keyboard-outline" size={13} color={palette.inkFaint} />
      <Text className="font-data text-[11px] text-ink-faint">{text}</Text>
    </View>
  );
}

type OptionState = 'idle' | 'right' | 'wrong' | 'dim';

const cardByState: Record<OptionState, string> = {
  idle: 'border-line-strong bg-surface-raised',
  right: 'border-vital bg-vital-dim',
  wrong: 'border-alarm bg-alarm-dim',
  dim: 'border-line bg-surface opacity-50',
};

const badgeByState: Record<OptionState, string> = {
  idle: 'border-line-strong bg-surface',
  right: 'border-vital bg-vital',
  wrong: 'border-alarm bg-alarm',
  dim: 'border-line bg-surface',
};

export function OptionCard({
  letter,
  label,
  state,
  onPress,
}: {
  letter: string;
  label: string;
  state: OptionState;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      cue={null}
      rule={state === 'idle'}
      disabled={state !== 'idle'}
      onPress={onPress}
      className={`min-h-[60px] flex-row items-center gap-4 rounded border px-4 py-3.5 ${cardByState[state]}`}
    >
      <OptionBadge letter={letter} state={state} />
      <OptionLabel label={label} />
    </PressableScale>
  );
}

function OptionBadge({ letter, state }: { letter: string; state: OptionState }) {
  const hover = useHover();
  const tint = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(hover ? hover.value : 0, [0, 1], [1, 1.08]) }] }));
  return (
    <Animated.View style={tint}>
      <View className={`h-9 w-9 items-center justify-center rounded-sm border ${badgeByState[state]}`}>
        {state === 'right' ? (
          <Icon name="check" size={18} color={palette.canvas} />
        ) : state === 'wrong' ? (
          <Icon name="close" size={18} color="#FFFFFF" />
        ) : (
          <Text className="font-data-medium text-sm text-ink-muted">{letter}</Text>
        )}
      </View>
    </Animated.View>
  );
}

/** The label nudges right under the pointer. */
function OptionLabel({ label }: { label: string }) {
  const hover = useHover();
  const nudge = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(hover ? hover.value : 0, [0, 1], [0, 4]) }] }));
  return (
    <Animated.View style={[{ flex: 1 }, nudge]}>
      <Text className="text-[15px] leading-[22px] text-ink">{label}</Text>
    </Animated.View>
  );
}
