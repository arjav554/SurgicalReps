import { View } from 'react-native';

import { PlateImage } from '@/components/ui/PlateImage';
import { Text } from '@/components/ui/Text';
import type { Figure } from '@/data/figures';

/**
 * An atlas plate as a lit museum exhibit: pale linework on the dark page, with the figure number and
 * Gray's own caption set beneath it as a gallery label. Label and caption are rendered as supplied.
 */
export function FigurePlate({ figure, height = 300 }: { figure: Figure; height?: number }) {
  return (
    <View className="overflow-hidden rounded border border-line bg-canvas">
      <PlateImage figure={figure} height={height} accessible={false} />
      <View className="flex-row items-baseline gap-3 border-t border-line px-4 py-3">
        <Text className="font-data-semibold text-[11px] uppercase tracking-[1.5px] text-gold">{figure.label}</Text>
        <Text className="flex-1 font-display-italic text-[14px] leading-5 text-ink-muted">{figure.caption}</Text>
      </View>
    </View>
  );
}
