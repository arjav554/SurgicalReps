import { useEffect, useId, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { palette } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One PQRST complex as (x, y) in unit space: x ∈ [0,1], y is up-positive around the baseline. */
function beat(): [number, number][] {
  const pts: [number, number][] = [[0, 0]];
  const bump = (from: number, to: number, height: number, steps = 8) => {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      pts.push([from + (to - from) * t, Math.sin(Math.PI * t) * height]);
    }
  };
  pts.push([0.12, 0]);
  bump(0.12, 0.22, 0.1); // P wave
  pts.push([0.28, 0], [0.31, -0.08], [0.345, 0.9], [0.38, -0.25], [0.41, 0]); // QRS
  pts.push([0.5, 0]);
  bump(0.5, 0.66, 0.18); // T wave
  pts.push([1, 0]);
  return pts;
}

interface EcgTraceProps {
  width: number;
  height: number;
  beats?: number;
  color?: string;
  /** Milliseconds for the sweep to cross the full width. */
  period?: number;
}

/** A bedside-monitor ECG sweep: a faint full trace with a crisp segment running along it (no glow). */
export function EcgTrace({ width, height, beats = 3, color = palette.ink, period = 3600 }: EcgTraceProps) {
  const { d, length } = useMemo(() => {
    const unit = beat();
    const baseline = height * 0.62;
    const amp = height * 0.55;
    const points: [number, number][] = [];
    for (let b = 0; b < beats; b++) {
      for (const [x, y] of unit) points.push([((b + x) / beats) * width, baseline - y * amp]);
    }
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
    }
    const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return { d: path, length: len };
  }, [width, height, beats]);

  // SVG ids are document-global on web; keep each trace's gradient separate.
  const gradientId = `ecg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const reduced = useReducedMotion();
  const offset = useSharedValue(length);
  useEffect(() => {
    offset.set(length);
    if (reduced) return;
    offset.set(withRepeat(withTiming(0, { duration: period, easing: Easing.linear }), -1, false));
  }, [length, period, offset, reduced]);

  const segment = length * 0.28;
  const pulseProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));

  if (width <= 0 || height <= 0) return null;

  return (
    <View aria-hidden style={{ width, height }}>
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity="0" />
          <Stop offset="0.12" stopColor={color} stopOpacity="1" />
          <Stop offset="0.88" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={d} stroke={color} strokeOpacity={0.12} strokeWidth={1.2} fill="none" />
      <AnimatedPath
        d={d}
        stroke={`url(#${gradientId})`}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={[segment, length - segment]}
        animatedProps={pulseProps}
      />
    </Svg>
    </View>
  );
}
