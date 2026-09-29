import { createContext, useContext, type ReactNode } from 'react';
import { useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/** Scroll offset of the enclosing screen, shared with `Reveal` children. */
const ScrollContext = createContext<SharedValue<number> | null>(null);

export function ScrollProvider({ scrollY, children }: { scrollY: SharedValue<number>; children: ReactNode }) {
  return <ScrollContext.Provider value={scrollY}>{children}</ScrollContext.Provider>;
}

/**
 * Fades its children in (a restrained 320 ms) the first time they scroll into view.
 * Without a ScrollProvider it simply reveals on mount.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const scrollY = useContext(ScrollContext);
  const { height } = useWindowDimensions();
  const ref = useAnimatedRef<Animated.View>();
  const shown = useSharedValue(0);
  const laidOut = useSharedValue(0);

  useAnimatedReaction(
    () => (scrollY ? scrollY.value : 0) + laidOut.value,
    () => {
      if (shown.value > 0 || laidOut.value === 0) return;
      const box = measure(ref);
      // Never leave content hidden: if the layout can't be measured, just show it.
      if (box === null || box.pageY < height - 24) {
        shown.set(withDelay(delay, withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) })));
      }
    },
  );

  const animated = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * distance }],
  }));

  return (
    <Animated.View ref={ref} style={[style, animated]} onLayout={() => laidOut.set(laidOut.value + 1)}>
      {children}
    </Animated.View>
  );
}
