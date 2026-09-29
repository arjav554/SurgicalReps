import { Image, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { Figure } from '@/data/figures';

/** An atlas-style figure: the engraving on warm paper with a numbered caption and credit. */
export function FigurePlate({ figure }: { figure: Figure }) {
  return (
    <View className="overflow-hidden rounded border border-line bg-paper">
      <Image
        source={figure.plate}
        accessibilityLabel={figure.caption}
        resizeMode="contain"
        style={{ width: '100%', aspectRatio: figure.aspect, maxHeight: 280 }}
      />
      <View className="flex-row items-baseline gap-2 border-t border-paper-ink/10 px-4 py-3">
        <Text className="font-data-semibold text-[11px] uppercase tracking-[1.5px] text-paper-muted">
          {figure.label}
        </Text>
        <Text className="flex-1 font-display-italic text-[14px] leading-5 text-paper-ink">{figure.caption}</Text>
      </View>
    </View>
  );
}
