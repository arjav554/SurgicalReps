import { router } from 'expo-router';
import { View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { LEGAL_DOCUMENTS, LEGAL_ORDER, type LegalDocId } from '@/legal/documents';

/** Privacy, terms and cookie notice links, in the order src/legal defines. `current` is shown as the open page. */
export function LegalLinks({ current }: { current?: LegalDocId }) {
  return (
    <View className="flex-row flex-wrap gap-x-6 gap-y-2">
      {LEGAL_ORDER.map((id) => {
        const active = id === current;
        return (
          <PressableScale
            key={id}
            accessibilityRole="link"
            aria-current={active ? 'page' : undefined}
            cue="tick"
            tint={false}
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: id } })}
          >
            <Text className={`font-ui text-[13px] underline ${active ? 'text-ink' : 'text-ink-muted'}`}>
              {LEGAL_DOCUMENTS[id].title}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
