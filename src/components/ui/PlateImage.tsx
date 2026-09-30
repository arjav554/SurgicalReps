import { Image, StyleSheet, View, type DimensionValue, type ImageStyle, type StyleProp } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Spotlight } from '@/components/ui/Spotlight';
import type { Figure } from '@/data/figures';
import { palette } from '@/theme';

/**
 * Turns the cream-paper plate into pale linework on the page: invert, then a contrast push that clips the
 * paper to pure black, and a `screen` blend so black is transparent and the gold spotlight shows through.
 * A touch of sepia keeps the linework warm rather than cold blue.
 */
const inverted: ImageStyle = {
  filter: 'invert(1) contrast(1.05) brightness(0.7) sepia(0.2)',
  mixBlendMode: 'screen',
} as ImageStyle;

/**
 * An anatomical plate as marble-white linework glowing on the dark page. The caption and figure label are
 * not drawn here: they are content, so callers render them exactly as `figures.ts` supplies them.
 */
export function PlateImage({
  figure,
  width = '100%',
  height,
  spotlight = true,
  vignette = true,
  opacity = 1,
  style,
  accessible = true,
}: {
  figure: Figure;
  width?: DimensionValue;
  height: number;
  spotlight?: boolean;
  /** Fades the edges into the page so cropped plates never show a hard rectangle. */
  vignette?: boolean;
  opacity?: number;
  style?: StyleProp<ImageStyle>;
  /** False when adjacent text already says what the plate shows. */
  accessible?: boolean;
}) {
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {spotlight && <Spotlight />}
      <Image
        source={figure.plate}
        accessible={accessible}
        accessibilityLabel={accessible ? figure.caption : undefined}
        aria-hidden={!accessible}
        resizeMode="contain"
        style={[{ width: '100%', height: '100%', opacity }, inverted, style]}
      />
      {vignette && <Vignette />}
    </View>
  );
}

function Vignette() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="edge" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0.5" stopColor={palette.canvas} stopOpacity={0} />
            <Stop offset="1" stopColor={palette.canvas} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#edge)" />
      </Svg>
    </View>
  );
}
