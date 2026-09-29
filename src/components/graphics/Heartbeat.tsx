import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';

/** A heart icon that beats at the patient's actual heart rate. */
export function Heartbeat({ bpm, color, size = 12 }: { bpm: number; color: string; size?: number }) {
  const scale = useSharedValue(1);
  const period = Math.max(300, Math.min(2000, 60000 / (bpm || 60)));

  useEffect(() => {
    scale.set(1);
    scale.set(withRepeat(
      withSequence(
        withTiming(1.35, { duration: period * 0.12, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: period * 0.25, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: period * 0.63 }),
      ),
      -1,
      false,
    ));
  }, [period, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Icon name="heart" size={size} color={color} />
    </Animated.View>
  );
}
