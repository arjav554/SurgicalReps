import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/ui/Text';
import { useKeyShortcuts } from '@/lib/keyboard';
import type { InfoNode, Vital } from '@/types/procedure';

import { NodeTag } from './NodeTag';
import { VitalsStrip } from './VitalsStrip';

interface InfoStepProps {
  node: InfoNode;
  /** Current monitor readings (the node's own, or carried forward); omitted when a side monitor shows them. */
  vitals?: Vital[];
  onContinue: () => void;
}

/** A clinical update, laid out like a chart note, with Continue directly beneath it. */
export function InfoStep({ node, vitals, onContinue }: InfoStepProps) {
  useKeyShortcuts({ enter: onContinue, ' ': onContinue, arrowright: onContinue });

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-5 pb-4 lg:grow lg:justify-center lg:pb-16">
      <NodeTag label="Clinical update" tone="signal" icon="clipboard-pulse-outline" />
      {vitals && <VitalsStrip vitals={vitals} />}
      <Animated.View entering={FadeInDown.delay(vitals ? 180 : 40).duration(320)}>
        <View className="gap-5 rounded border border-line bg-surface/60 p-5 lg:p-6">
          <View className="flex-row gap-4">
            <View className="w-[3px] bg-signal/70" />
            <Text className="flex-1 text-[17px] leading-7 text-ink lg:text-[18px] lg:leading-[30px]">{node.text}</Text>
          </View>
          <ActionButton label="Continue" icon="arrow-right" shortcut="Enter" onPress={onContinue} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}
