import { useEffect } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { OutcomeMark } from '@/components/graphics/OutcomeMark';
import { SourceLine } from '@/components/ReferenceLink';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useKeyShortcuts } from '@/lib/keyboard';
import type { Complication } from '@/store/useSimulationStore';
import { palette } from '@/theme';
import type { ProcedureNode, Reference } from '@/types/procedure';

import { VitalsStrip } from './VitalsStrip';

interface ComplicationOverlayProps {
  complication: Complication;
  /** Node the incorrect answer led to; its text states the clinical outcome. */
  outcome: ProcedureNode | undefined;
  /** The procedure's references, for attributing the rationale. */
  references: Reference[];
  onRestart: () => void;
}

/**
 * Full-screen, non-dismissable alarm state. Restart is the only way out:
 * the Android back button is swallowed while this is mounted.
 */
export function ComplicationOverlay({ complication, outcome, references, onRestart }: ComplicationOverlayProps) {
  const insets = useSafeAreaInsets();
  const { choice } = complication;
  const alarm = useSharedValue(0);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    alarm.set(withRepeat(withSequence(withTiming(1, { duration: 650 }), withTiming(0.25, { duration: 650 })), -1));
    return () => subscription.remove();
  }, [alarm]);

  const pulse = useAnimatedStyle(() => ({ opacity: alarm.value }));
  useKeyShortcuts({ r: onRestart, enter: onRestart });

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      accessibilityViewIsModal
      accessibilityLiveRegion="assertive"
    >
      <View className="absolute inset-0 bg-alarm-veil" />
      {/* Monitor-style alarm frame. */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderWidth: 2, borderColor: palette.alarm, pointerEvents: 'none' },
          pulse,
        ]}
      />

      <View className="flex-1 px-5" style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }}>
        <View className="mb-6 flex-row items-center justify-between rounded-sm bg-alarm/15 px-3 py-2">
          <View className="flex-row items-center gap-2">
            <Animated.View style={pulse}>
              <Icon name="alert-octagon" size={16} color={palette.alarm} />
            </Animated.View>
            <Text className="font-data-semibold text-[12px] uppercase tracking-[2.5px] text-alarm">Complication</Text>
          </View>
          <Animated.View style={pulse}>
            <Text className="font-data text-[11px] uppercase tracking-[2px] text-alarm">Alarm</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(280)} style={{ flex: 1 }}>
          <ScrollView className="flex-1" contentContainerClassName="gap-6 pb-6">
            <OutcomeMark success={false} />
            {outcome && outcome.type !== 'chance' && (
              <>
                <Text className="font-headline text-[32px] leading-[39px] text-ink">{outcome.text}</Text>
                {outcome.vitals && <VitalsStrip vitals={outcome.vitals} />}
              </>
            )}

            <View className="gap-2 border-l-2 border-alarm bg-alarm-dim py-3 pl-4 pr-3">
              <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-alarm">
                {choice.kind === 'multi' ? 'Your selection' : 'Your call'}
              </Text>
              {choice.selected.map((s) => (
                <Text key={s.optionIndex} className="text-[15px] leading-[22px] text-ink">
                  <Text className="font-data text-alarm">{s.letter} </Text>
                  {s.label}
                </Text>
              ))}
            </View>

            {choice.feedback && (
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Icon name="book-open-variant" size={15} color={palette.inkMuted} />
                  <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-ink-muted">
                    What the evidence says
                  </Text>
                </View>
                <Text className="text-[16px] leading-[26px] text-ink">{choice.feedback}</Text>
                <SourceLine references={references} cite={choice.cite} />
              </View>
            )}
          </ScrollView>
        </Animated.View>

        <ActionButton label="Restart the case" icon="restart" variant="danger" shortcut="R" onPress={onRestart} />
      </View>
    </Animated.View>
  );
}
