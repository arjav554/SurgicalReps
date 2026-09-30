import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { AccountButton } from '@/components/AccountButton';
import { ActionButton } from '@/components/ActionButton';
import { LegalLinks } from '@/components/LegalLinks';
import { EcgTrace } from '@/components/graphics/EcgTrace';
import { Logo } from '@/components/graphics/Logo';
import { ScrollRule } from '@/components/graphics/ScrollRule';
import { ArcCarousel } from '@/components/home/ArcCarousel';
import { PearlCarousel } from '@/components/home/PearlCarousel';
import { ProcedureRow } from '@/components/home/ProcedureCard';
import { ProcedureVisual } from '@/components/ProcedureVisual';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal, ScrollProvider } from '@/components/ui/ScrollReveal';
import { Text } from '@/components/ui/Text';
import { CLINICAL_DISCLAIMER } from '@/data/disclaimers';
import { FIGURE_CREDIT } from '@/data/figures';
import { procedures } from '@/data/procedures';
import {
  SPECIALTIES,
  primarySpecialtyLabel,
  specialtiesOf,
  specialty,
  specialtyChoice,
  trainingStage,
  type SpecialtyId,
} from '@/data/specialties';
import { cue } from '@/lib/feedback';
import { useBreakpoint, useCountUp } from '@/lib/layout';
import { pickNextRep, recommendedFor } from '@/lib/recommend';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore, type LearnerProfile } from '@/store/useProfileStore';
import { EMPTY_PROGRESS, isMastered, useProcedureProgress, useProgressStore } from '@/store/useProgressStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { palette } from '@/theme';
import type { Procedure } from '@/types/procedure';

const MAX_WIDTH = 1200;
const RULE_GUTTER = 28;
const PREVIEW_WIDTH = 340;

type LibraryFilter = 'for-you' | 'all' | SpecialtyId;

/** Library sections that have at least one case. */
const sectionCount = SPECIALTIES.filter((s) => procedures.some((p) => specialtiesOf(p.id).includes(s.id))).length;

/** Cases shown under a library filter; "For you" keeps recommendation order. */
function filterLibrary(filter: LibraryFilter, profile: LearnerProfile | null, query: string): Procedure[] {
  const base =
    filter === 'for-you'
      ? recommendedFor(profile, procedures)
      : filter === 'all'
        ? procedures
        : procedures.filter((p) => specialtiesOf(p.id).includes(filter));
  const q = query.trim().toLowerCase();
  if (!q) return base;
  return base.filter((p) =>
    [p.title, p.description, p.category ?? '', primarySpecialtyLabel(p.id)].join(' ').toLowerCase().includes(q),
  );
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { breakpoint, width, height } = useBreakpoint();
  const desktop = breakpoint === 'desktop';
  const gutter = desktop ? 56 : 20;
  const contentWidth = Math.min(width, MAX_WIDTH) - gutter * 2;
  const wide = contentWidth >= 880;
  // Hovering a library row previews its plate beside the list, when there is room for both.
  const preview = desktop && contentWidth >= 1000;

  const scrollY = useSharedValue(0);
  const maxScroll = useSharedValue(1);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
    maxScroll.set(Math.max(1, event.contentSize.height - event.layoutMeasurement.height));
  });
  const progress = useDerivedValue(() => Math.min(1, Math.max(0, scrollY.value / maxScroll.value)));

  // The incision rail's scalpel is also a scroll handle.
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const seek = (to: number, animated: boolean) => scrollRef.current?.scrollTo({ y: to * maxScroll.get(), animated });

  const [condensed, setCondensed] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > 280,
    (now, before) => {
      if (now !== before) scheduleOnRN(setCondensed, now);
    },
  );

  const profile = useProfileStore((s) => s.profile);
  const [query, setQuery] = useState('');
  // Until the learner picks a tab, show their recommendations if they have a profile.
  const [chosen, setChosen] = useState<LibraryFilter | null>(null);
  const filter: LibraryFilter =
    chosen === 'for-you' && !profile ? 'all' : (chosen ?? (profile ? 'for-you' : 'all'));
  const listed = useMemo(() => filterLibrary(filter, profile, query), [filter, profile, query]);
  const byProcedure = useProgressStore((s) => s.byProcedure);
  const nextRep = pickNextRep(procedures, byProcedure, profile);
  const suggestions = useMemo(() => {
    const recommended = profile ? recommendedFor(profile, procedures) : [];
    return (recommended.length > 0 ? recommended : procedures).filter((p) => p.id !== nextRep.id).slice(0, 9);
  }, [profile, nextRep.id]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const previewed = listed.find((p) => p.id === hoveredId) ?? listed[0];
  const rowWide = contentWidth - (preview ? PREVIEW_WIDTH + 40 : 0) >= 640;

  return (
    <View className="flex-1 flex-row bg-canvas">
      <View className="flex-1">
        <ScrollProvider scrollY={scrollY}>
          <Animated.ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(_, h) => maxScroll.set(Math.max(1, h - height))}
            contentContainerStyle={{
              paddingTop: insets.top + 18,
              paddingBottom: insets.bottom + 48,
              paddingHorizontal: gutter,
              width: '100%',
              maxWidth: MAX_WIDTH,
              alignSelf: 'center',
            }}
          >
            <Masthead />
            <Hero contentWidth={contentWidth} wide={wide} />

            {suggestions.length > 0 && (
              <Reveal>
                <View className="mt-16 gap-2">
                  <View className="items-center gap-2">
                    <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">
                      {profile ? 'More for you' : 'More reps'}
                    </Text>
                    <Text
                      accessibilityRole="header"
                      className="text-center font-headline text-[34px] leading-[40px] text-ink lg:text-[42px] lg:leading-[48px]"
                    >
                      Choose your next case
                    </Text>
                  </View>
                  <ArcCarousel items={suggestions} width={contentWidth} />
                </View>
              </Reveal>
            )}

            <View className="mt-14">
              <PearlCarousel />
            </View>

            <Reveal>
              <View className="mt-14 gap-5">
                <View className={wide ? 'flex-row items-end justify-between gap-6' : 'gap-4'}>
                  <View className="gap-1.5">
                    <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">Case library</Text>
                    <Text className="font-headline text-[34px] leading-[40px] text-ink lg:text-[42px] lg:leading-[48px]">
                      {filter === 'for-you' ? 'Recommended for you' : `${procedures.length} cases, ${sectionCount} specialties`}
                    </Text>
                  </View>
                  <SearchField value={query} onChange={setQuery} />
                </View>
                <SpecialtyTabs selected={filter} hasProfile={!!profile} wrap={wide} onSelect={setChosen} />
              </View>
            </Reveal>

            <View className={preview ? 'mt-1 flex-row items-start' : 'mt-1'} style={preview ? { gap: 40 } : undefined}>
              <View className="flex-1 border-t border-line-strong">
                {listed.length === 0 ? (
                  <Animated.View entering={FadeIn}>
                    <View className="items-center gap-2 py-12">
                      <Icon name="text-search" size={26} color={palette.inkFaint} />
                      <Text className="text-ink-muted">
                        {query.trim() ? `No procedures match “${query}”.` : 'No cases here yet.'}
                      </Text>
                    </View>
                  </Animated.View>
                ) : (
                  listed.map((procedure) => (
                    <Animated.View key={procedure.id} entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)}>
                      <ProcedureRow
                        procedure={procedure}
                        index={procedures.indexOf(procedure)}
                        wide={rowWide}
                        onHover={preview ? setHoveredId : undefined}
                      />
                    </Animated.View>
                  ))
                )}
              </View>
              {preview && previewed && (
                <View aria-hidden style={{ width: PREVIEW_WIDTH, marginTop: 24, position: 'sticky', top: 24 } as object}>
                  <ProcedureVisual procedure={previewed} width={PREVIEW_WIDTH} height={380} />
                </View>
              )}
            </View>

            <View className="mt-14 gap-2 border-t border-line pt-6">
              <Text className="font-data-medium text-[10px] uppercase tracking-[2px] text-ink-faint">Educational use</Text>
              <Text className="max-w-[760px] text-xs leading-5 text-ink-faint">
                Scenarios are condensed from the cited guidelines and trials and do not replace clinical judgment, attending
                supervision, or local protocols. {FIGURE_CREDIT}
              </Text>
              <Text className="max-w-[760px] text-xs leading-5 text-ink-muted">{CLINICAL_DISCLAIMER}</Text>
              <View className="mt-3">
                <LegalLinks />
              </View>
            </View>
          </Animated.ScrollView>
        </ScrollProvider>

        {desktop && (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: (width - Math.min(width, MAX_WIDTH)) / 2 + 12,
              top: insets.top + 96,
              bottom: 64,
              width: RULE_GUTTER,
            }}
          >
            <ScrollRule progress={progress} onSeek={seek} />
          </View>
        )}

        {condensed && <StickyHeader scrollY={scrollY} maxScroll={maxScroll} />}
      </View>
    </View>
  );
}

function Masthead() {
  return (
    <View className="flex-row items-center justify-between border-b border-line pb-4">
      <View className="flex-row items-center gap-3">
        <Logo size={34} />
        <View>
          <Text className="font-ui-bold text-[15px] tracking-[0.6px] text-ink">Mental Reps</Text>
          <Text className="font-data text-[10px] uppercase tracking-[2px] text-ink-faint">Surgical decision simulator</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <AccountButton />
        <SoundToggle />
      </View>
    </View>
  );
}

/** The quiz's effect, stated plainly with a way to change it; or an invitation to take it. */
function TailorLine() {
  const profile = useProfileStore((s) => s.profile);
  const open = () => router.push('/onboarding');
  if (!profile) {
    return (
      <PressableScale accessibilityRole="link" cue="tick" tint={false} onPress={open} className="self-start">
        <View className="flex-row items-center gap-2">
          <Icon name="tune-variant" size={15} color={palette.ink} />
          <Text className="text-[14px] text-ink underline">Tailor cases to your specialty</Text>
          <Text className="font-data text-[11px] text-ink-faint">3 questions</Text>
        </View>
      </PressableScale>
    );
  }
  const who = trainingStage(profile.stage).short;
  const choice = specialtyChoice(profile.specialty);
  const text =
    profile.specialty === 'undecided'
      ? `Set up for ${article(who)} ${who} still choosing a specialty.`
      : `Set up for ${article(who)} ${who} in ${choice.label}.`;
  return (
    <View className="flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
      <Text className="text-[14px] text-ink">{text}</Text>
      <PressableScale accessibilityRole="link" accessibilityLabel="Change your specialty profile" cue="tick" tint={false} onPress={open}>
        <Text className="font-ui text-[13px] text-ink-muted underline">Change</Text>
      </PressableScale>
    </View>
  );
}

/** Optional: guests with progress are told it lives on this device, and how to back it up. */
function BackupLine({ reps }: { reps: number }) {
  const status = useAuthStore((s) => s.status);
  if (status !== 'signedOut' || reps === 0) return null;
  return (
    <PressableScale accessibilityRole="link" cue="tick" tint={false} onPress={() => router.push('/account')} className="self-start">
      <Text className="text-[13px] leading-5 text-ink-faint">
        Progress is saved on this device. <Text className="text-[13px] text-ink-muted underline">Sign in to back it up</Text>{' '}
        (optional).
      </Text>
    </PressableScale>
  );
}

function Hero({ contentWidth, wide }: { contentWidth: number; wide: boolean }) {
  const byProcedure = useProgressStore((s) => s.byProcedure);
  const all = Object.values(byProcedure);
  const reps = all.reduce((sum, p) => sum + p.attempts, 0);
  const clean = all.reduce((sum, p) => sum + p.successes, 0);
  const mastered = procedures.filter((p) => isMastered(byProcedure[p.id] ?? EMPTY_PROGRESS)).length;
  const profile = useProfileStore((s) => s.profile);
  const next = pickNextRep(procedures, byProcedure, profile);

  // A wide, tracked wordmark; the featured plate rises over its right-hand end.
  const size = wide ? Math.min(140, Math.floor(contentWidth / 8.2)) : Math.min(56, Math.floor(contentWidth / 7.2));
  const leftWidth = wide ? Math.round(contentWidth * 0.5) : contentWidth;
  const rightWidth = wide ? contentWidth - leftWidth - 48 : contentWidth;

  return (
    <View className="mt-6">
      <View aria-hidden pointerEvents="none">
        <Text
          numberOfLines={1}
          className="font-headline text-ink-muted"
          style={{ fontSize: size, lineHeight: Math.round(size * 1.05), letterSpacing: Math.round(size * 0.08) }}
        >
          MENTAL REPS
        </Text>
      </View>

      <View className={wide ? 'flex-row items-start' : 'mt-4 gap-12'} style={wide ? { gap: 48 } : undefined}>
        <View style={{ width: leftWidth }} className="gap-8">
          <Animated.View entering={FadeIn.duration(420)}>
            <View className="gap-5">
              <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">
                Deliberate practice · graded against the evidence
              </Text>
              <Text
                accessibilityRole="header"
                className="font-headline text-[40px] leading-[44px] text-ink lg:text-[54px] lg:leading-[58px]"
              >
                Rehearse the decisions that matter.
              </Text>
              <Text className="max-w-[540px] font-display text-[17px] leading-[27px] text-ink-muted lg:text-[19px] lg:leading-[30px]">
                Guideline-based cases for surgical trainees. Every call is checked against published recommendations, and
                case findings vary on every run.
              </Text>
              <TailorLine />
            </View>
          </Animated.View>

          <EcgTrace width={leftWidth} height={56} beats={wide ? 6 : 4} />

          <View className="gap-3">
            <Ledger
              items={[
                { label: 'Mastered', value: mastered, suffix: `/${procedures.length}` },
                { label: 'Reps', value: reps },
                { label: 'Clean runs', value: reps ? Math.round((clean / reps) * 100) : 0, suffix: '%', empty: !reps },
              ]}
            />
            <BackupLine reps={reps} />
          </View>
        </View>

        <Animated.View
          entering={FadeIn.delay(120).duration(420)}
          style={{ width: rightWidth, marginTop: wide ? -Math.round(size * 0.42) : 0, zIndex: 2 }}
        >
          <FeaturedCase procedure={next} width={rightWidth} tailored={!!profile} wide={wide} />
        </Animated.View>
      </View>
    </View>
  );
}

/** Stats set as a ledger: hairline-ruled figures, no boxes. */
function Ledger({ items }: { items: { label: string; value: number; suffix?: string; empty?: boolean }[] }) {
  return (
    <View className="flex-row border-y border-line">
      {items.map((item, i) => (
        <LedgerItem key={item.label} {...item} first={i === 0} />
      ))}
    </View>
  );
}

function LedgerItem({
  label,
  value,
  suffix = '',
  empty = false,
  first,
}: {
  label: string;
  value: number;
  suffix?: string;
  empty?: boolean;
  first: boolean;
}) {
  const shown = useCountUp(value);
  return (
    <View className={`flex-1 gap-1 py-3.5 ${first ? 'pr-4' : 'border-l border-line px-4'}`}>
      <Text className="font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">{label}</Text>
      <Text className="font-data-medium text-[24px] text-ink">{empty ? '—' : `${shown}${suffix}`}</Text>
    </View>
  );
}

function FeaturedCase({
  procedure,
  width,
  tailored,
  wide,
}: {
  procedure: Procedure;
  width: number;
  tailored: boolean;
  wide: boolean;
}) {
  const progress = useProcedureProgress(procedure.id);
  const open = () => router.push({ pathname: '/procedure/[id]', params: { id: procedure.id } });
  return (
    <View className="gap-4">
      <PressableScale accessibilityRole="button" accessibilityLabel={procedure.title} tint={false} depth={0.995} onPress={open}>
        <ProcedureVisual procedure={procedure} width={width} variant="bare" height={wide ? 440 : 300} />
      </PressableScale>
      <View className="flex-row items-baseline justify-between gap-3 border-b border-line pb-2">
        <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">
          {tailored ? 'Recommended for you' : progress.attempts === 0 ? 'Suggested next case' : 'Next rep'}
        </Text>
        <Text numberOfLines={1} className="shrink font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint">
          {primarySpecialtyLabel(procedure.id)}
        </Text>
      </View>
      <View className="gap-2">
        <Text className="font-display-bold text-[24px] leading-[30px] text-ink">{procedure.title}</Text>
        <Text numberOfLines={3} className="text-[14px] leading-[22px] text-ink-muted">
          {procedure.description}
        </Text>
      </View>
      <ActionButton label={progress.attempts === 0 ? 'Open the case' : 'Continue practising'} icon="arrow-right" onPress={open} />
    </View>
  );
}

/** Condensed header once the hero has scrolled away, with a hairline page-progress rule. */
function StickyHeader({ scrollY, maxScroll }: { scrollY: SharedValue<number>; maxScroll: SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const meter = useAnimatedStyle(() => ({ width: `${Math.min(100, (scrollY.value / maxScroll.value) * 100)}%` }));
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
    >
      <View className="bg-canvas" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between gap-4 px-5 py-2.5">
          <View className="flex-row items-center gap-2.5">
            <Logo size={24} />
            <Text className="font-ui-bold text-[13px] tracking-[0.6px] text-ink">Mental Reps</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <AccountButton />
            <SoundToggle />
          </View>
        </View>
        <View className="h-px bg-line">
          <Animated.View style={[{ height: '100%', backgroundColor: palette.accent }, meter]} />
        </View>
      </View>
    </Animated.View>
  );
}

function SoundToggle() {
  const soundOn = useSettingsStore((s) => s.soundOn);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  return (
    <PressableScale
      accessibilityRole="switch"
      aria-checked={soundOn}
      accessibilityLabel={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
      cue={null}
      onPress={() => {
        toggleSound();
        if (!soundOn) setTimeout(() => cue('tick'), 0);
      }}
      className="h-9 flex-row items-center gap-2 rounded-sm border border-line px-2.5"
    >
      <Icon name={soundOn ? 'volume-high' : 'volume-off'} size={16} color={soundOn ? palette.ink : palette.inkFaint} />
      <Text className="hidden font-data text-[10px] uppercase tracking-[1.5px] text-ink-faint lg:flex">
        {soundOn ? 'Sound on' : 'Muted'}
      </Text>
    </PressableScale>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      className={`h-10 min-w-[260px] flex-row items-center gap-2 rounded-sm border bg-surface px-3 ${
        focused ? 'border-ink-muted' : 'border-line'
      }`}
    >
      <Icon name="magnify" size={17} color={focused ? palette.ink : palette.inkFaint} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search procedures"
        placeholderTextColor={palette.inkFaint}
        accessibilityLabel="Search procedures"
        className="flex-1 font-ui text-[14px] text-ink"
        style={{ outlineStyle: 'none' } as object}
      />
      {value.length > 0 && (
        <PressableScale accessibilityRole="button" accessibilityLabel="Clear search" cue="tick" tint={false} onPress={() => onChange('')}>
          <Icon name="close" size={15} color={palette.inkFaint} />
        </PressableScale>
      )}
    </View>
  );
}

/**
 * Specialty filter as text tabs with an accent underline. A case can appear under several specialties.
 * Wraps on wide screens; scrolls sideways on phones so fourteen sections don't stack six rows deep.
 */
function SpecialtyTabs({
  selected,
  hasProfile,
  wrap,
  onSelect,
}: {
  selected: LibraryFilter;
  hasProfile: boolean;
  wrap: boolean;
  onSelect: (f: LibraryFilter) => void;
}) {
  const profile = useProfileStore((s) => s.profile);
  const tabs: { key: LibraryFilter; label: string; count: number }[] = [
    ...(hasProfile ? [{ key: 'for-you' as const, label: 'For you', count: recommendedFor(profile, procedures).length }] : []),
    { key: 'all', label: 'All', count: procedures.length },
    ...SPECIALTIES.map((s) => ({
      key: s.id,
      label: s.short,
      count: procedures.filter((p) => specialtiesOf(p.id).includes(s.id)).length,
    })).filter((t) => t.count > 0),
  ];
  const row = tabs.map((tab) => {
    const active = tab.key === selected;
    return (
      <PressableScale
        key={tab.key}
        accessibilityRole="tab"
        aria-selected={active}
        accessibilityLabel={tab.key === 'for-you' || tab.key === 'all' ? undefined : specialty(tab.key).label}
        cue="tick"
        tint={false}
        onPress={() => onSelect(tab.key)}
        className="pt-2"
      >
        <View className="flex-row items-baseline gap-1.5">
          <Text className={`text-[14px] ${active ? 'font-ui-semibold text-ink' : 'font-ui text-ink-muted'}`}>{tab.label}</Text>
          <Text className="font-data text-[10px] text-ink-faint">{tab.count}</Text>
        </View>
        <View className="mt-2 h-[2px]" style={{ backgroundColor: active ? palette.accent : 'transparent' }} />
      </PressableScale>
    );
  });
  if (wrap) return <View className="flex-row flex-wrap gap-x-6">{row}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 22, paddingRight: 20 }}>
      {row}
    </ScrollView>
  );
}
