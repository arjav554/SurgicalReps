import { View } from 'react-native';

import { EcgTrace } from '@/components/graphics/EcgTrace';
import { FigurePlate } from '@/components/FigurePlate';
import { Icon } from '@/components/ui/Icon';
import { PlateImage } from '@/components/ui/PlateImage';
import { Text } from '@/components/ui/Text';
import { figureFor } from '@/data/figures';
import { palette, styleForCategory } from '@/theme';
import type { Procedure } from '@/types/procedure';

/**
 * The procedure's atlas plate, or a ruled emblem when no plate exists.
 * `card` is a framed exhibit with its gallery label; `bare` lets the plate float on the page with only a
 * small label line, for overlapping a headline.
 */
export function ProcedureVisual({
  procedure,
  width,
  variant = 'card',
  height = 300,
}: {
  procedure: Procedure;
  width: number;
  variant?: 'card' | 'bare';
  height?: number;
}) {
  const figure = figureFor(procedure.id);
  if (figure && variant === 'card') return <FigurePlate figure={figure} height={height} />;
  if (figure) {
    return (
      <View className="gap-2">
        <PlateImage figure={figure} height={height} accessible={false} />
        <View className="flex-row items-baseline gap-3 px-1">
          <Text className="font-data-semibold text-[11px] uppercase tracking-[1.5px] text-gold">{figure.label}</Text>
          <Text numberOfLines={1} className="flex-1 font-display-italic text-[13px] text-ink-muted">
            {figure.caption}
          </Text>
        </View>
      </View>
    );
  }

  const { icon } = styleForCategory(procedure.category);
  return (
    <View className="items-center justify-center overflow-hidden rounded border border-line bg-surface" style={{ height }}>
      <View className="absolute bottom-3 left-0 right-0 items-center opacity-40">
        <EcgTrace width={width} height={56} beats={4} color={palette.inkFaint} period={4200} />
      </View>
      <View className="h-20 w-20 items-center justify-center rounded-sm border border-line-strong bg-canvas">
        <Icon name={icon} size={38} color={palette.inkMuted} />
      </View>
    </View>
  );
}
