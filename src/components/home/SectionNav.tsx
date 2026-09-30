import { ScrollView, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { palette } from '@/theme';

export interface NavItem {
  key: string;
  label: string;
}

/**
 * Text buttons that jump straight to a part of the page. The section you are in is marked with a gold rule.
 * Scrolls sideways when the row is wider than the screen.
 */
export function SectionNav({
  items,
  active,
  onJump,
  compact = false,
}: {
  items: NavItem[];
  /** Key of the section currently in view. */
  active: string;
  onJump: (key: string) => void;
  /** Tighter spacing, for the condensed header. */
  compact?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={{ gap: compact ? 20 : 26, alignItems: 'flex-end' }}
    >
      {items.map((item) => {
        const here = item.key === active;
        return (
          <PressableScale
            key={item.key}
            accessibilityRole="link"
            aria-current={here ? 'location' : undefined}
            accessibilityLabel={`Go to ${item.label}`}
            cue="tick"
            tint={false}
            onPress={() => onJump(item.key)}
            className="pt-1"
          >
            <Text
              numberOfLines={1}
              className={`text-[13px] ${here ? 'font-ui-semibold text-ink' : 'font-ui text-ink-muted'}`}
            >
              {item.label}
            </Text>
            <View className="mt-2 h-[2px]" style={{ backgroundColor: here ? palette.accent : 'transparent' }} />
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
