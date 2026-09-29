import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { palette } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const FRAME = 4 * 50;
const CHECK = 'M16 29 L24 37 L40 19';
const CHECK_LEN = 35;
const CROSS = 'M18 18 L38 38 M38 18 L18 38';
const CROSS_LEN = 57;

/** A square frame and a check (success, bone) or cross (failure, red) that draw themselves in. */
export function OutcomeMark({ success, size = 52 }: { success: boolean; size?: number }) {
  const frame = useSharedValue(FRAME);
  const mark = useSharedValue(1);

  useEffect(() => {
    frame.set(withTiming(0, { duration: 460, easing: Easing.out(Easing.cubic) }));
    mark.set(withDelay(320, withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) })));
  }, [frame, mark]);

  const color = success ? palette.ink : palette.accent;
  const markLen = success ? CHECK_LEN : CROSS_LEN;
  const frameProps = useAnimatedProps(() => ({ strokeDashoffset: frame.value }));
  const markProps = useAnimatedProps(() => ({ strokeDashoffset: mark.value * markLen }));

  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Rect x="3" y="3" width="50" height="50" rx="3" stroke={color} strokeOpacity={0.15} strokeWidth="1.5" fill="none" />
      <AnimatedRect
        x="3"
        y="3"
        width="50"
        height="50"
        rx="3"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray={[FRAME, FRAME]}
        animatedProps={frameProps}
      />
      <AnimatedPath
        d={success ? CHECK : CROSS}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
        strokeDasharray={[markLen, markLen]}
        animatedProps={markProps}
      />
    </Svg>
  );
}
