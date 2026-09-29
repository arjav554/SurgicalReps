import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { procedures } from '@/data/procedures';
import { collectPearls, orderPearls, randomSeed } from '@/lib/pearls';
import { relevance } from '@/lib/recommend';
import { useProfileStore } from '@/store/useProfileStore';
import { palette } from '@/theme';

const DWELL_MS = 9000;
const ALL_PEARLS = collectPearls(procedures);

/**
 * Rotating evidence pearls from across the catalogue, set as an editorial pull quote.
 * Hover pauses; arrows step; the quote opens its case.
 */
export function PearlCarousel() {
  // A new order each visit; pearls from the learner's own specialty come first.
  const [seed] = useState(randomSeed);
  const profile = useProfileStore((s) => s.profile);
  const pearls = useMemo(
    () => orderPearls(ALL_PEARLS, seed, (p) => (relevance(p.procedureId, profile) >= 2 ? 1 : 0)),
    [seed, profile],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useSharedValue(0);

  useEffect(() => {
    if (paused || pearls.length === 0) return;
    timer.set(0);
    timer.set(withTiming(1, { duration: DWELL_MS, easing: Easing.linear }));
    const id = setTimeout(() => setIndex((i) => (i + 1) % pearls.length), DWELL_MS);
    return () => clearTimeout(id);
  }, [index, paused, pearls.length, timer]);

  const bar = useAnimatedStyle(() => ({ width: `${timer.value * 100}%` }));
  const pearl = pearls[index];
  if (!pearl) return null;
  const step = (delta: number) => setIndex((i) => (i + delta + pearls.length) % pearls.length);

  return (
    <Pressable onHoverIn={() => setPaused(true)} onHoverOut={() => setPaused(false)} className="border-y border-line">
      <View className="flex-row items-center justify-between pb-2 pt-4">
        <View className="flex-row items-center gap-3">
          <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">Clinical pearl</Text>
          <Text className="font-data text-[11px] text-ink-faint">
            {String(index + 1).padStart(2, '0')} / {pearls.length}
          </Text>
        </View>
        <View className="flex-row gap-1">
          <StepButton icon="arrow-left" label="Previous pearl" onPress={() => step(-1)} />
          <StepButton icon="arrow-right" label="Next pearl" onPress={() => step(1)} />
        </View>
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Open ${pearl.procedureTitle}`}
        rule
        depth={0.995}
        onPress={() => router.push({ pathname: '/procedure/[id]', params: { id: pearl.procedureId } })}
      >
        <Animated.View key={index} entering={FadeIn.duration(360)} exiting={FadeOut.duration(140)}>
          <View className="min-h-[150px] flex-row gap-5 py-4 pl-4">
            <View className="w-[2px] bg-signal" />
            <View className="flex-1 gap-3">
              <Text numberOfLines={3} className="font-display-italic text-[19px] leading-[27px] text-ink">
                {pearl.prompt}
              </Text>
              <Text numberOfLines={5} className="max-w-[860px] text-[14px] leading-[22px] text-ink-muted">
                {pearl.text}
              </Text>
              <Text className="font-data text-[11px] text-ink-faint">
                — {pearl.procedureTitle}
                {pearl.sources.length > 0 ? ` · ${pearl.sources.join('; ')}` : ''}
              </Text>
            </View>
          </View>
        </Animated.View>
      </PressableScale>

      <View className="h-px bg-line">
        <Animated.View style={[{ height: '100%', backgroundColor: paused ? palette.inkFaint : palette.accent }, bar]} />
      </View>
    </Pressable>
  );
}

function StepButton({ icon, label, onPress }: { icon: 'arrow-left' | 'arrow-right'; label: string; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      cue="tick"
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-sm border border-line"
    >
      <Icon name={icon} size={16} color={palette.inkMuted} />
    </PressableScale>
  );
}
