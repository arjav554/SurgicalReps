import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { StreakMeter } from '@/components/graphics/StreakMeter';
import { Icon } from '@/components/ui/Icon';
import { PlateImage } from '@/components/ui/PlateImage';
import { PressableScale, useHover } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { figureFor } from '@/data/figures';
import { primarySpecialtyLabel } from '@/data/specialties';
import { callsPerCase, caseVariants } from '@/lib/caseShape';
import { isRecommended } from '@/lib/recommend';
import { useProfileStore } from '@/store/useProfileStore';
import { MASTERY_STREAK, useProcedureProgress } from '@/store/useProgressStore';
import { palette, styleForCategory } from '@/theme';
import type { Procedure } from '@/types/procedure';

/**
 * One entry in the case library, set like a journal's contents page:
 * index number, atlas thumbnail, title and dek, specialty, meta, and mastery.
 */
export function ProcedureRow({
  procedure,
  index,
  wide,
  onHover,
}: {
  procedure: Procedure;
  index: number;
  wide: boolean;
  /** Desktop: called with this case's id when the pointer or keyboard focus arrives. */
  onHover?: (id: string) => void;
}) {
  const progress = useProcedureProgress(procedure.id);
  const forYou = useProfileStore((s) => isRecommended(procedure.id, s.profile));
  const filedUnder = primarySpecialtyLabel(procedure.id);
  const variants = caseVariants(procedure);
  const meta = [
    `${callsPerCase(procedure)} calls`,
    variants > 1 ? `${variants} variants` : null,
    `${procedure.references.length} source${procedure.references.length === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={procedure.title}
      rule
      depth={0.995}
      onHoverIn={onHover ? () => onHover(procedure.id) : undefined}
      onFocus={onHover ? () => onHover(procedure.id) : undefined}
      onPress={() => router.push({ pathname: '/procedure/[id]', params: { id: procedure.id } })}
      className="border-b border-line"
    >
      {wide ? (
        <View className="flex-row items-center gap-5 py-5 pl-4 pr-3">
          <IndexNumber n={index + 1} />
          <Thumb procedure={procedure} />
          <View className="flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
              <Text className="font-display text-[20px] leading-[26px] text-ink">{procedure.title}</Text>
              {forYou && <ForYouTag />}
            </View>
            <Text numberOfLines={1} className="text-[13px] leading-5 text-ink-muted">
              {procedure.description}
            </Text>
          </View>
          <View style={{ width: 228 }} className="gap-1">
            <Text numberOfLines={1} className="font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">
              {filedUnder}
            </Text>
            <Text className="font-data text-[11px] text-ink-muted">{meta}</Text>
          </View>
          <StreakMeter value={progress.currentStreak} total={MASTERY_STREAK} />
          <Arrow />
        </View>
      ) : (
        <View className="gap-2 py-5 pl-3 pr-1">
          <View className="flex-row items-center gap-3">
            <IndexNumber n={index + 1} />
            <Text numberOfLines={1} className="flex-1 font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">
              {filedUnder}
            </Text>
            {forYou && <ForYouTag />}
            <StreakMeter value={progress.currentStreak} total={MASTERY_STREAK} size={8} />
          </View>
          <View className="flex-row gap-3">
            <Thumb procedure={procedure} />
            <View className="flex-1 gap-1">
              <Text className="font-display text-[19px] leading-[25px] text-ink">{procedure.title}</Text>
              <Text numberOfLines={2} className="text-[13px] leading-5 text-ink-muted">
                {procedure.description}
              </Text>
              <Text className="mt-1 font-data text-[11px] text-ink-faint">{meta}</Text>
            </View>
          </View>
        </View>
      )}
    </PressableScale>
  );
}

/** Marks cases matched to the learner's specialty profile. */
function ForYouTag() {
  return (
    <View className="rounded-sm border border-signal/60 px-1.5 py-[1px]">
      <Text className="font-data-medium text-[9px] uppercase tracking-[1.2px] text-signal">For you</Text>
    </View>
  );
}

function IndexNumber({ n }: { n: number }) {
  const hover = useHover();
  const color = useAnimatedStyle(() => ({
    color: interpolateColor(hover ? hover.value : 0, [0, 1], [palette.inkFaint, palette.accent]),
  }));
  return (
    <Animated.Text style={[{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, width: 26 }, color]}>
      {String(n).padStart(2, '0')}
    </Animated.Text>
  );
}

/** Atlas thumbnail as pale linework in a ruled square, or the category glyph. */
function Thumb({ procedure }: { procedure: Procedure }) {
  const figure = figureFor(procedure.id);
  if (figure) {
    return (
      <View className="h-16 w-16 overflow-hidden rounded-sm border border-line bg-canvas">
        <PlateImage figure={figure} width={64} height={64} spotlight={false} vignette={false} accessible={false} />
      </View>
    );
  }
  const { icon } = styleForCategory(procedure.category);
  return (
    <View className="h-16 w-16 items-center justify-center rounded-sm border border-line-strong">
      <Icon name={icon} size={24} color={palette.inkMuted} />
    </View>
  );
}

function Arrow() {
  const hover = useHover();
  const style = useAnimatedStyle(() => {
    const h = hover ? hover.value : 0;
    return { opacity: interpolate(h, [0, 1], [0.35, 1]), transform: [{ translateX: interpolate(h, [0, 1], [0, 4]) }] };
  });
  return (
    <Animated.View style={style}>
      <Icon name="arrow-right" size={18} color={palette.ink} />
    </Animated.View>
  );
}
