import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/ui/Icon';
import { PlateImage } from '@/components/ui/PlateImage';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { figureFor } from '@/data/figures';
import { primarySpecialtyLabel } from '@/data/specialties';
import { palette, styleForCategory } from '@/theme';
import type { Procedure } from '@/types/procedure';

const CENTER_H = 200;
const SIDE_H = 130;

/**
 * Three cases on a curved rule: the one in focus is large and lit, its neighbours sit lower and dimmer.
 * The arrows turn the wheel. Press the focused case to open it.
 */
export function ArcCarousel({ items, width }: { items: Procedure[]; width: number }) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;

  const count = items.length;
  const at = (offset: number) => items[(index + offset + count * 3) % count];
  const turn = (by: number) => setIndex((i) => (i + by + count) % count);
  const slots = count >= 3 ? [-1, 0, 1] : count === 2 ? [0, 1] : [0];
  const colW = Math.min(300, Math.floor((width - 96) / Math.max(slots.length, 1)));
  const arcH = CENTER_H + 60;

  return (
    <View className="gap-6">
      <View className="items-center justify-center" style={{ height: arcH + 96 }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: 40, left: 0, right: 0, height: arcH }}>
          <Svg width="100%" height="100%" viewBox="0 0 1000 260" preserveAspectRatio="none">
            <Path d="M0 120 Q500 -40 1000 120" fill="none" stroke={palette.lineStrong} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </Svg>
        </View>

        <View className="flex-row items-start justify-center" style={{ gap: 12 }}>
          {slots.map((offset) => {
            const procedure = at(offset);
            if (!procedure) return null;
            const focused = offset === 0;
            return (
              <Animated.View
                key={`${procedure.id}-${offset}`}
                entering={FadeIn.duration(320)}
                style={{ width: colW, marginTop: focused ? 0 : 44, opacity: focused ? 1 : 0.55 }}
              >
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={focused ? `Open ${procedure.title}` : `Show ${procedure.title}`}
                  tint={false}
                  depth={0.99}
                  onPress={() =>
                    focused
                      ? router.push({ pathname: '/procedure/[id]', params: { id: procedure.id } })
                      : turn(offset)
                  }
                >
                  <CaseFigure procedure={procedure} height={focused ? CENTER_H : SIDE_H} />
                  <View className="mt-3 items-center gap-1 px-2">
                    <Text
                      numberOfLines={2}
                      className={`text-center font-display ${focused ? 'text-[19px] leading-[25px] text-ink' : 'text-[15px] leading-5 text-ink-muted'}`}
                    >
                      {procedure.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className={`font-data-medium text-[10px] uppercase tracking-[1.5px] ${focused ? 'text-gold' : 'text-ink-faint'}`}
                    >
                      {primarySpecialtyLabel(procedure.id)}
                    </Text>
                  </View>
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {count > 1 && (
        <View className="flex-row items-center justify-center gap-5">
          <Arrow direction="left" onPress={() => turn(-1)} />
          <Text className="font-data text-[11px] tracking-[1.5px] text-ink-faint">
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </Text>
          <Arrow direction="right" onPress={() => turn(1)} />
        </View>
      )}
    </View>
  );
}

function CaseFigure({ procedure, height }: { procedure: Procedure; height: number }) {
  const figure = figureFor(procedure.id);
  if (figure) return <PlateImage figure={figure} height={height} accessible={false} />;
  const { icon } = styleForCategory(procedure.category);
  return (
    <View className="items-center justify-center" style={{ height }}>
      <Icon name={icon} size={40} color={palette.inkMuted} />
    </View>
  );
}

function Arrow({ direction, onPress }: { direction: 'left' | 'right'; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={direction === 'left' ? 'Previous case' : 'Next case'}
      cue="tick"
      tint={false}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full border border-field"
    >
      <Icon name={direction === 'left' ? 'chevron-left' : 'chevron-right'} size={18} color={palette.ink} />
    </PressableScale>
  );
}
