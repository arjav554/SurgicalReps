import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { palette } from '@/theme';

/**
 * A soft gold pool of light behind an object, like the lit pedestals in the marble reference.
 * Fills its parent; `pulse` breathes very slowly and is off under reduced motion.
 */
export function Spotlight({
  intensity = 0.2,
  pulse = true,
  originY = 0.45,
}: {
  intensity?: number;
  pulse?: boolean;
  /** Vertical centre of the light, 0 (top) to 1 (bottom). */
  originY?: number;
}) {
  const reduced = useReducedMotion();
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (!pulse || reduced) {
      breathe.set(1);
      return;
    }
    breathe.set(withRepeat(withTiming(0.72, { duration: 5200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [pulse, reduced, breathe]);

  const style = useAnimatedStyle(() => ({ opacity: breathe.value }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="pool" cx="50%" cy={`${originY * 100}%`} rx="52%" ry="48%" fx="50%" fy={`${originY * 100}%`}>
            <Stop offset="0" stopColor={palette.accent} stopOpacity={intensity} />
            <Stop offset="0.55" stopColor={palette.accent} stopOpacity={intensity * 0.28} />
            <Stop offset="1" stopColor={palette.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pool)" />
      </Svg>
    </Animated.View>
  );
}
