import { Image, StyleSheet, View, type DimensionValue, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Spotlight } from '@/components/ui/Spotlight';
import type { Figure } from '@/data/figures';
import { palette } from '@/theme';

/**
 * Turns the cream-paper plate into pale linework on the page: invert, then a contrast push that clips the
 * paper to pure black, and a `screen` blend so black is transparent and the soft wall wash shows through.
 * A touch of sepia keeps the linework warm rather than cold blue.
 */
const inverted: ViewStyle = {
  filter: 'invert(1) contrast(1.15) brightness(0.85) sepia(0.2)',
  mixBlendMode: 'screen',
} as ViewStyle;

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
      {/* The filter lives on a plain view: react-native-web applies an Image's own filter twice. */}
      <View style={[{ width: '100%', height: '100%', opacity }, inverted]}>
        <Image
          source={figure.plate}
          accessible={accessible}
          accessibilityLabel={accessible ? figure.caption : undefined}
          aria-hidden={!accessible}
          resizeMode="contain"
          style={[{ width: '100%', height: '100%' }, style]}
        />
      </View>
      {vignette && <Vignette />}
    </View>
  );
}

/** Feathers each edge into the page so a plate never shows a hard rectangle, without cropping it round. */
function Vignette() {
  const FEATHER = '14%';
  const fade = (id: string, x2: string, y2: string) => (
    <LinearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      <Stop offset="0" stopColor={palette.canvas} stopOpacity={1} />
      <Stop offset="1" stopColor={palette.canvas} stopOpacity={0} />
    </LinearGradient>
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          {fade('fadeTop', '0', '1')}
          {fade('fadeLeft', '1', '0')}
          <LinearGradient id="fadeBottom" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={palette.canvas} stopOpacity={1} />
            <Stop offset="1" stopColor={palette.canvas} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="fadeRight" x1="1" y1="0" x2="0" y2="0">
            <Stop offset="0" stopColor={palette.canvas} stopOpacity={1} />
            <Stop offset="1" stopColor={palette.canvas} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={FEATHER} fill="url(#fadeTop)" />
        <Rect x="0" y="86%" width="100%" height={FEATHER} fill="url(#fadeBottom)" />
        <Rect x="0" y="0" width={FEATHER} height="100%" fill="url(#fadeLeft)" />
        <Rect x="86%" y="0" width={FEATHER} height="100%" fill="url(#fadeRight)" />
      </Svg>
    </View>
  );
}
