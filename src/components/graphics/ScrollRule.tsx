import { useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { palette } from '@/theme';

const TRACK_W = 12;

/**
 * A slim page-progress rule for the desktop margin: a hairline that fills with gold as the page scrolls,
 * with a small blade-tip marker at the cut. Quiet by default; press anywhere on it to jump there.
 */
export function ScrollRule({
  progress,
  onSeek,
}: {
  /** 0 → 1 as the page scrolls from top to bottom. */
  progress: SharedValue<number>;
  onSeek: (to: number, animated: boolean) => void;
}) {
  const [height, setHeight] = useState(0);
  const fill = useAnimatedStyle(() => ({ height: `${progress.value * 100}%` }));
  const marker = useAnimatedStyle(() => ({ top: `${progress.value * 100}%` }));

  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);

  return (
    <View style={{ flex: 1, width: TRACK_W, alignItems: 'center' }} onLayout={onLayout}>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Page position"
        hitSlop={{ left: 10, right: 10 }}
        onPress={(e) => height > 0 && onSeek(Math.min(1, Math.max(0, e.nativeEvent.locationY / height)), true)}
        style={{ flex: 1, width: TRACK_W, alignItems: 'center', opacity: 0.75 }}
      >
        <View style={{ flex: 1, width: 1, backgroundColor: palette.line }}>
          <Animated.View style={[{ width: 1, backgroundColor: palette.accent }, fill]} />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: 7,
              height: 7,
              marginTop: -3,
              borderWidth: 1,
              borderColor: palette.accent,
              backgroundColor: palette.canvas,
              transform: [{ rotate: '45deg' }],
            },
            marker,
          ]}
        />
      </Pressable>
    </View>
  );
}
