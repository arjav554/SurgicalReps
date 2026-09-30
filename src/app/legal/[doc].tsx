import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { LegalLinks } from '@/components/LegalLinks';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { LEGAL_DOCUMENTS, type LegalBlock, type LegalDocId } from '@/legal/documents';
import { useBreakpoint } from '@/lib/layout';
import { goBack } from '@/lib/navigation';
import { palette } from '@/theme';

/** Privacy policy, terms of use, or the cookie and storage notice, rendered as supplied from src/legal. */
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useBreakpoint();
  const wide = width >= 900;
  const document = doc && doc in LEGAL_DOCUMENTS ? LEGAL_DOCUMENTS[doc as LegalDocId] : undefined;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        contentContainerStyle={{
          width: '100%',
          maxWidth: 820,
          alignSelf: 'center',
          paddingHorizontal: wide ? 40 : 20,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 56,
        }}
      >
        <View className="mb-10 flex-row items-center gap-4 border-b border-line pb-4">
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Back to the library"
            hitSlop={12}
            onPress={() => goBack('/')}
            className="h-9 flex-row items-center gap-1.5 rounded-sm border border-line pl-1.5 pr-3"
          >
            <Icon name="chevron-left" size={18} color={palette.inkMuted} />
            <Text className="font-ui-medium text-[13px] text-ink-muted">Library</Text>
          </PressableScale>
          <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-ink-faint">Legal</Text>
        </View>

        {document ? (
          <View className="gap-10">
            <View className="gap-4">
              <Text
                accessibilityRole="header"
                className="font-headline text-[42px] leading-[46px] text-ink lg:text-[56px] lg:leading-[58px]"
              >
                {document.title}
              </Text>
              <Text className="font-display text-[18px] leading-[28px] text-ink-muted">{document.summary}</Text>
            </View>

            {document.sections.map((section) => (
              <View key={section.heading} className="gap-3 border-t border-line pt-6">
                <Text accessibilityRole="header" className="font-display-bold text-[21px] leading-[28px] text-ink">
                  {section.heading}
                </Text>
                {section.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View className="gap-5">
            <Text className="font-headline text-[36px] leading-[42px] text-ink">Page not found</Text>
            <Text className="text-[15px] leading-6 text-ink-muted">There is no legal page called “{doc}”.</Text>
            <ActionButton label="Back to the library" icon="chevron-left" variant="ghost" onPress={() => router.replace('/')} />
          </View>
        )}

        <View className="mt-14 border-t border-line pt-6">
          <LegalLinks current={document?.id} />
        </View>
      </ScrollView>
    </View>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <Text className="text-[15px] leading-[24px] text-ink-muted">{block}</Text>;
  return (
    <View className="gap-2 pl-1">
      {block.map((line, i) => (
        <View key={i} className="flex-row gap-3">
          <Text className="text-[15px] leading-[24px] text-gold">·</Text>
          <Text className="flex-1 text-[15px] leading-[24px] text-ink-muted">{line}</Text>
        </View>
      ))}
    </View>
  );
}
