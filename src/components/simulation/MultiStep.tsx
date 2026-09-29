import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ActionButton } from '@/components/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { cue } from '@/lib/feedback';
import { KEYBOARD, optionKeys, useKeyShortcuts } from '@/lib/keyboard';
import { letterFor } from '@/store/useSimulationStore';
import { palette } from '@/theme';
import type { MultiSelectNode, Vital } from '@/types/procedure';

import { COMMIT_DELAY_MS, ShortcutHint } from './DecisionStep';
import { NodeTag } from './NodeTag';
import { VitalsStrip } from './VitalsStrip';

interface MultiStepProps {
  node: MultiSelectNode;
  /** Current monitor readings (the node's own, or carried forward); omitted when a side monitor shows them. */
  vitals?: Vital[];
  /** Original option indices in the order they are shown this attempt. */
  order: number[];
  onSubmit: (optionIndices: number[]) => void;
}

export function MultiStep({ node, vitals, order, onSubmit }: MultiStepProps) {
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const toggle = (optionIndex: number) => {
    if (verdict) return;
    cue('tick');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(optionIndex)) next.delete(optionIndex);
      else next.add(optionIndex);
      return next;
    });
  };

  const confirm = () => {
    if (verdict || selected.size === 0) return;
    const right = node.options.every((o, i) => o.isCorrect === selected.has(i));
    setVerdict(right ? 'right' : 'wrong');
    cue(right ? 'correct' : 'alarm');
    const picked = [...selected];
    timer.current = setTimeout(() => onSubmit(picked), COMMIT_DELAY_MS);
  };

  useKeyShortcuts(
    {
      ...optionKeys(order.length, (position) => {
        const optionIndex = order[position];
        if (optionIndex !== undefined) toggle(optionIndex);
      }),
      enter: confirm,
    },
    verdict === null,
  );

  const checkedCard =
    verdict === 'right' ? 'border-vital bg-vital-dim' : verdict === 'wrong' ? 'border-alarm bg-alarm-dim' : 'border-signal bg-signal-dim';
  const checkedBox =
    verdict === 'right' ? 'border-vital bg-vital' : verdict === 'wrong' ? 'border-alarm bg-alarm' : 'border-signal bg-signal';

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-5 pb-4 lg:grow lg:justify-center lg:pb-16">
      <NodeTag label="Select all that apply" tone="signal" icon="checkbox-multiple-marked-outline" />
      {vitals && <VitalsStrip vitals={vitals} />}

      <View className="gap-5 rounded border border-line bg-surface/60 p-4 lg:p-6">
        <Animated.View entering={FadeInDown.delay(60).duration(320)}>
          <Text className="font-display text-[22px] leading-[31px] text-ink lg:text-[25px] lg:leading-[35px]">{node.text}</Text>
        </Animated.View>

        <View className="gap-2.5">
          {order.map((optionIndex, position) => {
            const option = node.options[optionIndex];
            if (!option) return null;
            const checked = selected.has(optionIndex);
            return (
              <Animated.View key={`${optionIndex}:${option.label}`} entering={FadeInDown.delay(140 + position * 55).duration(280)}>
                <PressableScale
                  accessibilityRole="checkbox"
                  aria-checked={checked}
                  cue={null}
                  depth={0.985}
                  rule={verdict === null}
                  disabled={verdict !== null}
                  onPress={() => toggle(optionIndex)}
                  className={`min-h-[54px] flex-row items-center gap-4 rounded border px-4 py-3 ${
                    checked ? checkedCard : 'border-line-strong bg-surface-raised'
                  } ${verdict && !checked ? 'opacity-50' : ''}`}
                >
                  <View className={`h-7 w-7 items-center justify-center rounded-sm border ${checked ? checkedBox : 'border-line-strong'}`}>
                    {checked ? (
                      <Icon name="check" size={16} color={verdict === 'wrong' ? '#FFFFFF' : palette.canvas} />
                    ) : (
                      <Text className="font-data text-[11px] text-ink-faint">{letterFor(position)}</Text>
                    )}
                  </View>
                  <Text className="flex-1 text-[15px] leading-[22px] text-ink">{option.label}</Text>
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>

        <View className="gap-3">
          <ActionButton
            label={selected.size === 0 ? 'Select at least one' : `Confirm ${selected.size} selected`}
            icon="check-all"
            cue={null}
            shortcut="Enter"
            disabled={selected.size === 0 || verdict !== null}
            onPress={confirm}
          />
          {KEYBOARD && <ShortcutHint text={`${letterFor(0)}–${letterFor(order.length - 1)} to toggle · Enter to confirm`} />}
        </View>
      </View>
    </ScrollView>
  );
}
