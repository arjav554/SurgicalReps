import { createContext, useContext, type ReactNode } from 'react';
import { useWindowDimensions, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
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

/** The enclosing screen's scroll offset, or null outside a ScrollProvider. */
export function useScrollY(): SharedValue<number> | null {
  return useContext(ScrollContext);
}

/**
 * A section that responds to where it is on screen: full size and full strength at the middle of the
 * viewport, easing smaller and dimmer as it leaves. Direct children of a scroll view's content container only,
 * since it reads its own offset from the container. `onMeasure` reports that offset for chapter tracking.
 */
export function ScrollFocus({
  children,
  strength = 0.12,
  onMeasure,
  style,
}: {
  children: ReactNode;
  /** How much smaller the section becomes at the edge of the viewport (0.12 = 12 %). */
  strength?: number;
  onMeasure?: (y: number) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const scrollY = useContext(ScrollContext);
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const top = useSharedValue(0);
  const size = useSharedValue(0);

  const animated = useAnimatedStyle(() => {
    if (!scrollY || reduced || size.value === 0) return {};
    const centre = top.value + size.value / 2 - scrollY.value;
    const away = Math.min(1, (Math.abs(centre - height / 2) / height) * 1.4);
    return { opacity: 1 - 0.55 * away * away, transform: [{ scale: 1 - strength * away }] };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    top.set(e.nativeEvent.layout.y);
    size.set(e.nativeEvent.layout.height);
    onMeasure?.(e.nativeEvent.layout.y);
  };

  return (
    <Animated.View onLayout={onLayout} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
