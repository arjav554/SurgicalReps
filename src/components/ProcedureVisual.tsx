import { View } from 'react-native';

import { EcgTrace } from '@/components/graphics/EcgTrace';
import { FigurePlate } from '@/components/FigurePlate';
import { Icon } from '@/components/ui/Icon';
import { figureFor } from '@/data/figures';
import { palette, styleForCategory } from '@/theme';
import type { Procedure } from '@/types/procedure';

/** The procedure's atlas plate, or a ruled emblem when no plate exists. */
export function ProcedureVisual({ procedure, width }: { procedure: Procedure; width: number }) {
  const figure = figureFor(procedure.id);
  if (figure) return <FigurePlate figure={figure} />;

  const { icon } = styleForCategory(procedure.category);
  return (
    <View className="h-44 items-center justify-center overflow-hidden rounded border border-line bg-surface">
      <View className="absolute bottom-3 left-0 right-0 items-center opacity-40">
        <EcgTrace width={width} height={56} beats={4} color={palette.inkFaint} period={4200} />
      </View>
      <View className="h-20 w-20 items-center justify-center rounded-sm border border-line-strong bg-canvas">
        <Icon name={icon} size={38} color={palette.inkMuted} />
      </View>
    </View>
  );
}
