import { Linking, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { citedReferences, shortCite } from '@/lib/citations';
import { palette } from '@/theme';
import type { Citation, EvidenceKind, Reference } from '@/types/procedure';

const KIND_LABEL: Record<EvidenceKind, string> = {
  guideline: 'Guideline',
  consensus: 'Consensus statement',
  trial: 'Randomized trial',
  'systematic-review': 'Systematic review',
  cohort: 'Cohort study',
  classification: 'Classification',
  review: 'Review',
  textbook: 'Textbook',
  regulatory: 'Regulatory',
};

/** Numbered, journal-style reference list with evidence type and identifiers; each entry opens its source. */
export function ReferenceList({ references }: { references: Reference[] }) {
  return (
    <View className="gap-3.5">
      {references.map((reference, index) => (
        <ReferenceRow key={reference.citation} index={index + 1} reference={reference} />
      ))}
    </View>
  );
}

function ReferenceRow({ index, reference }: { index: number; reference: Reference }) {
  const ids = [
    KIND_LABEL[reference.kind],
    reference.pmid ? `PMID ${reference.pmid}` : null,
    reference.doi ? `DOI ${reference.doi}` : null,
  ].filter(Boolean);
  return (
    <PressableScale accessibilityRole="link" cue={null} depth={0.99} onPress={() => Linking.openURL(reference.url)}>
      <View className="flex-row gap-3">
        <Text className="w-7 pt-[1px] font-data-medium text-xs text-signal">[{index}]</Text>
        <View className="flex-1 gap-1">
          <Text className="text-[13px] leading-5 text-ink-muted">{reference.citation}</Text>
          <Text className="font-data text-[10px] leading-4 text-ink-faint">{ids.join('  ·  ')}</Text>
        </View>
        <View className="pt-[2px]">
          <Icon name="open-in-new" size={13} color={palette.inkFaint} />
        </View>
      </View>
    </PressableScale>
  );
}

/** Inline attribution under a rationale: "Sources  [2] Di Saverio 2020  [4] CODA 2020", each a link. */
export function SourceLine({ references, cite }: { references: Reference[]; cite: Citation | undefined }) {
  const cited = citedReferences(references, cite);
  if (cited.length === 0) return null;
  return (
    <View className="flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
      <Text className="font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">Sources</Text>
      {cited.map(({ n, reference }) => (
        <PressableScale
          key={n}
          accessibilityRole="link"
          accessibilityLabel={`Source ${n}: ${reference.citation}`}
          cue={null}
          tint={false}
          onPress={() => Linking.openURL(reference.url)}
        >
          <Text className="font-data text-[11px] text-ink-muted underline">
            [{n}] {shortCite(reference)}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}
