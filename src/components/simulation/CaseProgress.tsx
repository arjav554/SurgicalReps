import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { palette } from '@/theme';

/** Thin progress rail under the header; tints red on a failed case. */
export function CaseProgress({ progress, failed }: { progress: number; failed: boolean }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.set(withTiming(Math.max(0.03, Math.min(1, progress)), {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    }));
  }, [progress, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View className="h-[2px] overflow-hidden bg-line" accessibilityRole="progressbar">
      <Animated.View
        style={[{ height: '100%', backgroundColor: failed ? palette.alarm : palette.signal }, fill]}
      />
    </View>
  );
}
