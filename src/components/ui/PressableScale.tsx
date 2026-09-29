import { createContext, useContext, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { cue as playCue, type Cue } from '@/lib/feedback';
import { palette } from '@/theme';

/** 0 → 1 while the pointer hovers the nearest PressableScale (web/desktop), for child hover effects. */
const HoverContext = createContext<SharedValue<number> | null>(null);

export function useHover(): SharedValue<number> | null {
  return useContext(HoverContext);
}

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Sound/haptic played on press; `null` for none. */
  cue?: Cue | null;
  /** How far the surface sinks on press. */
  depth?: number;
  /** A faint bone wash on hover (default on). */
  tint?: boolean;
  /** A 2px accent rule along the left edge on hover, for list rows. */
  rule?: boolean;
}

/**
 * A pressable with restrained, editorial feedback: a tone shift (and optional accent rule)
 * under the pointer, a slight sink under the finger, and a quiet cue.
 * Children can read the hover amount via `useHover()`.
 */
export function PressableScale({
  children,
  className,
  style,
  cue = 'tap',
  depth = 0.985,
  tint = true,
  rule = false,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(1);
  const hover = useSharedValue(0);

  const sink = useAnimatedStyle(() => ({ transform: [{ scale: pressed.value }] }));
  const wash = useAnimatedStyle(() => ({ opacity: hover.value * 0.05 }));
  const edge = useAnimatedStyle(() => ({ opacity: hover.value, transform: [{ scaleY: 0.4 + hover.value * 0.6 }] }));

  return (
    <Animated.View style={sink}>
      <Pressable
        {...rest}
        disabled={disabled}
        onHoverIn={() => {
          if (!disabled) hover.set(withTiming(1, { duration: 140 }));
        }}
        onHoverOut={() => {
          hover.set(withTiming(0, { duration: 200 }));
        }}
        onPressIn={() => {
          pressed.set(withTiming(depth, { duration: 80 }));
        }}
        onPressOut={() => {
          pressed.set(withTiming(1, { duration: 120 }));
        }}
        onPress={(event) => {
          if (cue) playCue(cue);
          onPress?.(event);
        }}
        className={className}
        style={style}
      >
        {tint && (
          <Animated.View
            style={[
              { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: palette.ink, pointerEvents: 'none' },
              wash,
            ]}
          />
        )}
        <HoverContext.Provider value={hover}>{children}</HoverContext.Provider>
        {rule && (
          <Animated.View
            style={[
              { position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, backgroundColor: palette.accent, pointerEvents: 'none' },
              edge,
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}
