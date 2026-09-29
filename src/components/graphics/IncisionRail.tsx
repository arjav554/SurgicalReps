import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui/Text';
import { palette, withAlpha } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Planned length of the midline incision, for the ticks and readout. */
const INCISION_CM = 15;
const MARKER = palette.inkFaint;
const WOUND_RED = palette.accent;
const FRESH_RED = '#EC7A6E';
const SKIN_EDGE = palette.ink;
/** Length of the brighter, just-cut segment trailing the blade. */
const FRESH = 14;

/** Present but secondary; full strength while the pointer is over it. */
const RESTING_OPACITY = 0.85;
/** How far above the blade tip a press still counts as grabbing the scalpel. */
const GRAB_REACH = 72;

/**
 * A straight midline incision drawn down the desktop margin as the page scrolls:
 * a skin-marker plan, a scalpel that follows it, parting skin edges, a
 * freshly cut segment behind the blade, and centimetre ticks.
 *
 * With `onSeek`, the scalpel doubles as a scroll handle: drag the blade to
 * scroll, or press anywhere on the line to jump there.
 */
export function IncisionRail({
  progress,
  width,
  height,
  onSeek,
}: {
  /** 0 → 1 as the page scrolls from top to bottom. */
  progress: SharedValue<number>;
  width: number;
  height: number;
  /** Scroll the page to this 0 → 1 position. */
  onSeek?: (progress: number, animated: boolean) => void;
}) {
  const headerH = 44;
  const footerH = 44;
  const fieldH = Math.max(200, height - headerH - footerH);
  const field = { x: 12, y: 4, w: width - 24, h: fieldH - 8 };
  const cx = field.x + field.w / 2 - 4;
  // Leave room above the first mark for the tilted scalpel handle.
  const top = field.y + 76;
  const bottom = field.y + field.h - 24;
  const length = bottom - top;
  const d = `M${cx},${top} L${cx},${bottom}`;

  const cutProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));
  // A short dash whose far end sits exactly at the blade tip.
  const freshProps = useAnimatedProps(() => ({ strokeDashoffset: FRESH - progress.value * length }));

  const grab = useSharedValue(0);
  const blade = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx - SCALPEL_TIP[0] },
      { translateY: top + progress.value * length - SCALPEL_TIP[1] },
      // Held like a pen: blade on the line, handle tilted back.
      { rotate: `${-SCALPEL_TILT}rad` },
      // Picked up slightly while dragged.
      { scale: 1 + grab.value * 0.1 },
    ],
  }));

  const breathe = useSharedValue(0.45);
  useEffect(() => {
    breathe.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.45, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, [breathe]);
  const tipGlow = useAnimatedStyle(() => ({
    opacity: breathe.value * (progress.value > 0.003 && progress.value < 0.997 ? 1 : 0.35),
    transform: [{ translateX: cx - 8 }, { translateY: top + progress.value * length - 8 }],
  }));

  const hover = useSharedValue(RESTING_OPACITY);
  const presence = useAnimatedStyle(() => ({ opacity: hover.value }));
  const [hovered, setHovered] = useState(false);

  // Dragging: where the field sits on the page, and how far the pointer is from the blade tip.
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ pageTop: 0, offset: 0 });
  const seekTo = (tipY: number, animated: boolean) =>
    onSeek?.(Math.min(1, Math.max(0, (tipY - top) / length)), animated);
  const startDrag = (event: GestureResponderEvent) => {
    const { locationY, pageY } = event.nativeEvent;
    const tipY = top + progress.get() * length;
    const onBlade = locationY >= tipY - GRAB_REACH && locationY <= tipY + 14;
    drag.current = { pageTop: pageY - locationY, offset: onBlade ? tipY - locationY : 0 };
    setDragging(true);
    grab.set(withTiming(1, { duration: 140 }));
    hover.set(withTiming(1, { duration: 140 }));
    // Pressing the line away from the blade jumps there; grabbing the blade just holds it.
    if (!onBlade) seekTo(locationY, true);
  };
  const moveDrag = (event: GestureResponderEvent) =>
    seekTo(event.nativeEvent.pageY - drag.current.pageTop + drag.current.offset, false);
  const endDrag = () => {
    setDragging(false);
    grab.set(withTiming(0, { duration: 200 }));
    if (!hovered) hover.set(withTiming(RESTING_OPACITY, { duration: 400 }));
  };

  // Readout, updated in whole-centimetre steps.
  const [cm, setCm] = useState(0);
  useAnimatedReaction(
    () => Math.round(progress.value * INCISION_CM),
    (value, previous) => {
      if (value !== previous) scheduleOnRN(setCm, value);
    },
  );
  const done = cm >= INCISION_CM;

  const rulerX = field.x + field.w - 10;
  const ticks = Array.from({ length: INCISION_CM + 1 }, (_, k) => top + (length * k) / INCISION_CM);

  return (
    <Pressable
      aria-hidden
      tabIndex={-1}
      onHoverIn={() => {
        setHovered(true);
        hover.set(withTiming(1, { duration: 240 }));
      }}
      onHoverOut={() => {
        setHovered(false);
        if (!dragging) hover.set(withTiming(RESTING_OPACITY, { duration: 400 }));
      }}
      // No text selection while dragging the blade on web.
      style={{ width, height, userSelect: 'none' } as object}
    >
      <Animated.View style={[{ flex: 1 }, presence]}>
        <View style={{ height: headerH }} className="justify-end px-3.5 pb-2.5">
          <Text className={`font-data text-[9px] uppercase tracking-[1.5px] ${dragging ? 'text-signal' : 'text-ink-faint'}`}>
            {onSeek && (hovered || dragging) ? 'Drag to scroll' : 'Midline incision'}
          </Text>
        </View>

        <View style={{ height: fieldH }}>
          <Svg width={width} height={fieldH}>
            <Defs>
              <Pattern id="skin" width="8" height="8" patternUnits="userSpaceOnUse">
                <Circle cx="1.5" cy="1.5" r="0.5" fill={palette.inkFaint} fillOpacity="0.28" />
              </Pattern>
            </Defs>

            {/* Drape window with towel-clip corner brackets. */}
            <Rect x={field.x} y={field.y} width={field.w} height={field.h} rx="3" fill="url(#skin)" stroke={palette.line} />
            {[
              [field.x + 7, field.y + 7, 1, 1],
              [field.x + field.w - 7, field.y + 7, -1, 1],
              [field.x + 7, field.y + field.h - 7, 1, -1],
              [field.x + field.w - 7, field.y + field.h - 7, -1, -1],
            ].map(([x, y, sx, sy]) => (
              <Path
                key={`${x}-${y}`}
                d={`M${x} ${y! + 9 * sy!} L${x} ${y} L${x! + 9 * sx!} ${y}`}
                stroke={palette.ink}
                strokeOpacity="0.35"
                strokeWidth="1.2"
                fill="none"
              />
            ))}

            {/* Centimetre ticks. */}
            {ticks.map((y, k) => (
              <Line
                key={k}
                x1={rulerX}
                y1={y}
                x2={rulerX - (k % 5 === 0 ? 6 : 3)}
                y2={y}
                stroke={palette.inkFaint}
                strokeOpacity={k % 5 === 0 ? 0.85 : 0.5}
                strokeWidth="1"
              />
            ))}

            {/* The skin-marker plan. */}
            <Path d={d} stroke={MARKER} strokeOpacity="0.9" strokeWidth="1.1" strokeDasharray={[3, 4]} fill="none" strokeLinecap="round" />

            {/* The incision: red interior with parting skin edges, drawn as the page scrolls. */}
            <AnimatedPath
              d={d}
              stroke={WOUND_RED}
              strokeOpacity="0.9"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={[length, length]}
              animatedProps={cutProps}
            />
            <AnimatedPath
              d={d}
              stroke={FRESH_RED}
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={[FRESH, length * 2]}
              animatedProps={freshProps}
            />
            <G transform="translate(-1.8, 0)">
              <AnimatedPath d={d} stroke={SKIN_EDGE} strokeOpacity="0.6" strokeWidth="0.9" fill="none" strokeDasharray={[length, length]} animatedProps={cutProps} />
            </G>
            <G transform="translate(1.8, 0)">
              <AnimatedPath d={d} stroke={SKIN_EDGE} strokeOpacity="0.6" strokeWidth="0.9" fill="none" strokeDasharray={[length, length]} animatedProps={cutProps} />
            </G>
          </Svg>

          <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 16, height: 16, pointerEvents: 'none' }, tipGlow]}>
            <View style={{ width: 16, height: 16, borderRadius: 2, borderWidth: 1, borderColor: withAlpha(palette.accent, 0.8) }} />
          </Animated.View>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                width: SCALPEL_SIZE[0],
                height: SCALPEL_SIZE[1],
                transformOrigin: `${SCALPEL_TIP[0]}px ${SCALPEL_TIP[1]}px`,
                pointerEvents: 'none',
              },
              blade,
            ]}
          >
            <Scalpel />
          </Animated.View>

          {onSeek && (
            // Transparent hit layer over the field, so press positions are always field-relative.
            <View
              style={[StyleSheet.absoluteFill, { cursor: dragging ? 'grabbing' : 'grab' } as object]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={startDrag}
              onResponderMove={moveDrag}
              onResponderRelease={endDrag}
              onResponderTerminate={endDrag}
            />
          )}
        </View>

        <View style={{ height: footerH }} className="justify-center px-3.5">
          <Text className={`font-data text-[10px] ${done ? 'text-vital' : 'text-ink-faint'}`}>
            {done ? 'Incision complete' : `${cm} / ${INCISION_CM} cm`}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const SCALE = 0.8;
const SCALPEL_SIZE = [22 * SCALE, 86 * SCALE] as const;
const SCALPEL_TILT = 0.55;
/** Blade tip within the scalpel drawing; the pivot for placement and rotation. */
const SCALPEL_TIP = [11 * SCALE, 84 * SCALE] as const;

/** Line-drawn scalpel (No. 10 blade on a No. 3 handle), pointing down. */
function Scalpel() {
  return (
    <Svg width={SCALPEL_SIZE[0]} height={SCALPEL_SIZE[1]} viewBox="0 0 22 86">
      {/* Handle */}
      <Rect x="7" y="1" width="8" height="46" rx="3.5" fill={palette.surfaceRaised} stroke={SKIN_EDGE} strokeWidth="1.1" />
      {[10, 14, 18, 22, 26].map((y) => (
        <Line key={y} x1="8.5" y1={y} x2="13.5" y2={y} stroke={palette.inkFaint} strokeWidth="0.9" />
      ))}
      <Rect x="8.5" y="44" width="5" height="9" rx="1" fill={palette.surfaceRaised} stroke={SKIN_EDGE} strokeWidth="1" />
      {/* Blade with a curved cutting belly */}
      <Path d="M8 52 L14 52 L15.5 62 C16.5 70 14 78 11 84 C9.5 78 8 70 8 62 Z" fill="#BDB7AB" fillOpacity="0.95" stroke={SKIN_EDGE} strokeWidth="1" />
      <Path d="M15.3 61 C16 69 13.6 77 11 84" stroke={palette.ink} strokeOpacity="0.9" strokeWidth="1.1" fill="none" />
    </Svg>
  );
}
