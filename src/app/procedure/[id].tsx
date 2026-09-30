import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { StreakMeter } from '@/components/graphics/StreakMeter';
import { ProcedureVisual } from '@/components/ProcedureVisual';
import { PlateImage } from '@/components/ui/PlateImage';
import { ReferenceList } from '@/components/ReferenceLink';
import { SectionLabel } from '@/components/simulation/TerminalStep';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal, ScrollProvider } from '@/components/ui/ScrollReveal';
import { Text } from '@/components/ui/Text';
import { figureFor } from '@/data/figures';
import { getProcedure } from '@/data/procedures';
import { sectionLabels, specialtyChoice } from '@/data/specialties';
import { callsPerCase, caseVariants } from '@/lib/caseShape';
import { formatDuration } from '@/lib/formatDuration';
import { useKeyShortcuts } from '@/lib/keyboard';
import { useBreakpoint } from '@/lib/layout';
import { goBack } from '@/lib/navigation';
import { isRecommended } from '@/lib/recommend';
import { useProfileStore } from '@/store/useProfileStore';
import { MASTERY_STREAK, isMastered, useProcedureProgress } from '@/store/useProgressStore';
import { palette } from '@/theme';
import type { Procedure } from '@/types/procedure';

const SPLIT_AT = 1000;
const REFERENCES_PREVIEW = 3;

/** Pre-brief: what the rep trains, where the content comes from, and how you have done so far. */
export default function BriefingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const procedure = getProcedure(id);
  const insets = useSafeAreaInsets();
  const { width, height } = useBreakpoint();
  const wide = width >= SPLIT_AT;
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  const begin = () => procedure && router.push({ pathname: '/simulation/[id]', params: { id: procedure.id } });
  useKeyShortcuts({ enter: begin });

  if (!procedure) {
    return (
      <View
        className="flex-1 justify-between bg-canvas px-5"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }}
      >
        <Text className="font-data text-sm text-ink-muted">{id}</Text>
        <ActionButton label="Back" variant="ghost" icon="chevron-left" onPress={() => goBack('/')} />
      </View>
    );
  }

  const gutter = wide ? 56 : 20;
  const panelWidth = wide ? Math.round(width * 0.6) : width;
  const contentWidth = Math.min(panelWidth, 720) - gutter * 2;

  const body = (
    <View className="gap-8">
      <TopBar procedure={procedure} clearCorner={!wide} />
      <Overview procedure={procedure} large={wide} />
      {!wide && <Plate procedure={procedure} width={contentWidth} />}
      <MasteryPanel procedure={procedure} />
      <Objectives procedure={procedure} />
      <Evidence procedure={procedure} />
      {wide && (
        <View className="pt-2">
          <ActionButton label="Begin simulation" icon="play" shortcut="Enter" onPress={begin} />
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 flex-row bg-canvas">
      {wide && <PlatePane procedure={procedure} width={width - panelWidth} height={height} />}

      <View className="flex-1">
        <ScrollProvider scrollY={scrollY}>
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
              width: '100%',
              maxWidth: 720,
              alignSelf: wide ? 'flex-start' : 'center',
              paddingHorizontal: gutter,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + (wide ? 64 : 120),
            }}
          >
            {body}
          </Animated.ScrollView>
        </ScrollProvider>

        {!wide && (
          <View
            className="absolute bottom-0 left-0 right-0 border-t border-line bg-canvas px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <BeginButton procedure={procedure} onPress={begin} />
          </View>
        )}
      </View>

      <BackToLibrary top={insets.top + 12} left={wide ? 32 : 20} />
    </View>
  );
}

/** Desktop: a centred plate with Gray's caption beneath it, balanced against the briefing. */
function PlatePane({ procedure, width, height }: { procedure: Procedure; width: number; height: number }) {
  const figure = figureFor(procedure.id);
  const plateHeight = Math.min(Math.round(height * 0.5), 460);
  return (
    <View style={{ width, height }} className="items-center justify-center border-r border-line bg-canvas px-12">
      <View style={{ width: '100%', maxWidth: 460 }} className="gap-5">
        <Animated.View entering={FadeIn.duration(600)}>
          {figure ? (
            <PlateImage figure={figure} height={plateHeight} accessible={false} />
          ) : (
            <ProcedureVisual procedure={procedure} width={width} variant="bare" height={plateHeight} />
          )}
        </Animated.View>
        {figure && (
          <View className="gap-1 border-t border-line pt-4">
            <Text className="font-data-semibold text-[11px] uppercase tracking-[2px] text-gold">{figure.label}</Text>
            <Text className="font-display-italic text-[15px] leading-[22px] text-ink-muted">{figure.caption}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function BeginButton({ procedure, onPress }: { procedure: Procedure; onPress: () => void }) {
  const progress = useProcedureProgress(procedure.id);
  return <ActionButton label={progress.attempts === 0 ? 'Begin simulation' : 'Run it again'} icon="play" onPress={onPress} />;
}

function TopBar({ procedure, clearCorner }: { procedure: Procedure; clearCorner: boolean }) {
  return (
    <View className="flex-row items-center gap-4 border-b border-line pb-4" style={clearCorner ? { paddingLeft: 116 } : undefined}>
      <Text numberOfLines={1} className="flex-1 font-data-medium text-[11px] uppercase tracking-[2px] text-ink-faint">
        {sectionLabels(procedure.id).join(' · ')}
      </Text>
    </View>
  );
}

/** Pinned to the corner so it stays in reach however far the briefing is scrolled. */
function BackToLibrary({ top, left }: { top: number; left: number }) {
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top, left, zIndex: 20 }}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Back to procedures"
        hitSlop={12}
        onPress={() => goBack('/')}
        className="h-9 flex-row items-center gap-1.5 rounded-sm border border-line-strong bg-canvas pl-1.5 pr-3"
      >
        <Icon name="chevron-left" size={18} color={palette.inkMuted} />
        <Text className="font-ui-medium text-[13px] text-ink-muted">Library</Text>
      </PressableScale>
    </View>
  );
}

function Plate({ procedure, width }: { procedure: Procedure; width: number }) {
  return (
    <Animated.View entering={FadeIn.duration(420)}>
      <ProcedureVisual procedure={procedure} width={width} variant="card" height={220} />
    </Animated.View>
  );
}

function Overview({ procedure, large = false }: { procedure: Procedure; large?: boolean }) {
  const variants = caseVariants(procedure);
  const profile = useProfileStore((s) => s.profile);
  const forYou = isRecommended(procedure.id, profile);
  const meta = [
    `${callsPerCase(procedure)} calls per case`,
    variants > 1 ? `${variants} case variants` : null,
    `${procedure.references.length} source${procedure.references.length === 1 ? '' : 's'}`,
  ].filter(Boolean);
  return (
    <Animated.View entering={FadeIn.delay(60).duration(380)}>
      <View className="gap-4">
        <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">
          {forYou && profile ? `Case briefing · For ${specialtyChoice(profile.specialty).label}` : 'Case briefing'}
        </Text>
        <Text className={`font-headline text-ink ${large ? 'text-[54px] leading-[58px]' : 'text-[36px] leading-[41px]'}`}>
          {procedure.title}
        </Text>
        <Text
          className={`max-w-[640px] font-display text-ink-muted ${large ? 'text-[19px] leading-[30px]' : 'text-[16px] leading-[26px]'}`}
        >
          {procedure.description}
        </Text>
        <View className="mt-1 flex-row flex-wrap border-y border-line">
          {meta.map((item, i) => (
            <Text
              key={item}
              className={`py-2.5 font-data text-[11px] uppercase tracking-[1.2px] text-ink-muted ${
                i === 0 ? 'pr-4' : 'border-l border-line px-4'
              }`}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function MasteryPanel({ procedure }: { procedure: Procedure }) {
  const progress = useProcedureProgress(procedure.id);
  const mastered = isMastered(progress);
  const remaining = MASTERY_STREAK - progress.currentStreak;
  return (
    <Reveal>
      <View className="gap-4 border-y border-line py-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">Mastery</Text>
            <Text className="font-ui-semibold text-[14px] text-ink">
              {mastered
                ? 'Mastered: keep it sharp'
                : progress.attempts === 0
                  ? 'Not yet attempted'
                  : `${remaining} more clean run${remaining === 1 ? '' : 's'} to master`}
            </Text>
          </View>
          <StreakMeter value={progress.currentStreak} total={MASTERY_STREAK} size={14} gap={4} />
        </View>
        <View className="flex-row">
          <MiniStat first label="Runs" value={String(progress.attempts)} />
          <MiniStat label="Clean" value={String(progress.successes)} />
          <MiniStat label="Best" value={progress.bestTimeMs === null ? '—' : formatDuration(progress.bestTimeMs)} />
        </View>
      </View>
    </Reveal>
  );
}

function Objectives({ procedure }: { procedure: Procedure }) {
  if (procedure.objectives.length === 0) return null;
  return (
    <Reveal>
      <View className="gap-4">
        <SectionLabel icon="target" label="Learning objectives" />
        <View className="border-t border-line">
          {procedure.objectives.map((objective, index) => (
            <Reveal key={objective} delay={index * 60}>
              <View className="flex-row gap-4 border-b border-line py-3.5">
                <Text className="w-7 pt-[2px] font-data-medium text-[12px] text-signal">{String(index + 1).padStart(2, '0')}</Text>
                <Text className="flex-1 text-[15px] leading-[23px] text-ink">{objective}</Text>
              </View>
            </Reveal>
          ))}
        </View>
      </View>
    </Reveal>
  );
}

function Evidence({ procedure }: { procedure: Procedure }) {
  const [expanded, setExpanded] = useState(false);
  if (procedure.references.length === 0) return null;
  const hidden = procedure.references.length - REFERENCES_PREVIEW;
  const shown = expanded ? procedure.references : procedure.references.slice(0, REFERENCES_PREVIEW);
  return (
    <Reveal>
      <View className="gap-4">
        <SectionLabel icon="book-open-page-variant" label="Evidence base" />
        <ReferenceList references={shown} />
        {hidden > 0 && (
          <PressableScale accessibilityRole="button" cue="tick" tint={false} onPress={() => setExpanded((v) => !v)}>
            <View className="flex-row items-center gap-1.5">
              <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={palette.ink} />
              <Text className="font-data text-[12px] text-ink underline">
                {expanded ? 'Show fewer' : `Show ${hidden} more source${hidden === 1 ? '' : 's'}`}
              </Text>
            </View>
          </PressableScale>
        )}
      </View>
    </Reveal>
  );
}

function MiniStat({ label, value, first = false }: { label: string; value: string; first?: boolean }) {
  return (
    <View className={`flex-1 ${first ? 'pr-3' : 'border-l border-line px-3'}`}>
      <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">{label}</Text>
      <Text className="font-data-medium text-[17px] text-ink">{value}</Text>
    </View>
  );
}
