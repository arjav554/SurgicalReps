import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { palette } from '@/theme';

/**
 * A faint, still pool of warm light behind an object, like a gallery wall wash. It sits low and wide so it
 * reads as lighting rather than a graphic; there is no animation.
 */
export function Spotlight({ intensity = 0.06, originY = 0.5 }: { intensity?: number; originY?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="wash" cx="50%" cy={`${originY * 100}%`} rx="70%" ry="60%" fx="50%" fy={`${originY * 100}%`}>
            <Stop offset="0" stopColor={palette.paper} stopOpacity={intensity} />
            <Stop offset="0.6" stopColor={palette.paper} stopOpacity={intensity * 0.3} />
            <Stop offset="1" stopColor={palette.paper} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#wash)" />
      </Svg>
    </View>
  );
}
