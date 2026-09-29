import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { palette } from '@/theme';

/**
 * Streak toward mastery as square segments (one per required clean run) that fill left to right.
 * Mastered meters fill in the accent.
 */
export function StreakMeter({
  value,
  total,
  size = 10,
  gap = 3,
}: {
  value: number;
  total: number;
  size?: number;
  gap?: number;
}) {
  const mastered = value >= total;
  return (
    <View className="flex-row" style={{ gap }} accessibilityLabel={`${Math.min(value, total)} of ${total} clean runs`}>
      {Array.from({ length: total }, (_, i) => (
        <Segment key={i} filled={i < value} color={mastered ? palette.accent : palette.ink} size={size} delay={i * 90} />
      ))}
    </View>
  );
}

function Segment({ filled, color, size, delay }: { filled: boolean; color: string; size: number; delay: number }) {
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.set(withDelay(delay, withTiming(filled ? 1 : 0, { duration: 260, easing: Easing.out(Easing.quad) })));
  }, [filled, delay, fill]);
  const style = useAnimatedStyle(() => ({ opacity: fill.value }));
  return (
    <View style={{ width: size, height: size, borderRadius: 1, borderWidth: 1, borderColor: palette.lineStrong }}>
      <Animated.View style={[{ flex: 1, margin: 1, backgroundColor: color }, style]} />
    </View>
  );
}
