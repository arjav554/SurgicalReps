import Svg, { Path, Rect } from 'react-native-svg';

import { palette } from '@/theme';

/** Brand mark: a square monitor tile with a single red pulse. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel="Surgical Reps">
      <Rect x="0.75" y="0.75" width="46.5" height="46.5" rx="4" fill={palette.surfaceRaised} stroke={palette.lineStrong} strokeWidth="1.5" />
      <Path d="M6 26 H16 L19 20 L23 33 L27 12 L30.5 26 H42" fill="none" stroke={palette.accent} strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}
