import { router } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { AccountButton } from '@/components/AccountButton';
import { ActionButton } from '@/components/ActionButton';
import { LegalLinks } from '@/components/LegalLinks';
import { EcgTrace } from '@/components/graphics/EcgTrace';
import { Logo } from '@/components/graphics/Logo';
import { ArcCarousel } from '@/components/home/ArcCarousel';
import { PearlCarousel } from '@/components/home/PearlCarousel';
import { ProcedureRow } from '@/components/home/ProcedureCard';
import { ProcedureVisual } from '@/components/ProcedureVisual';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal, ScrollProvider, useScrollY } from '@/components/ui/ScrollReveal';
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
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

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
  // Only offered once the quiz has been taken: these are the cases it recommends, not a generic list.
  const suggestions = useMemo(
    () => (profile ? recommendedFor(profile, procedures).filter((p) => p.id !== nextRep.id).slice(0, 9) : []),
    [profile, nextRep.id],
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const previewed = listed.find((p) => p.id === hoveredId) ?? listed[0];
  const rowWide = contentWidth - (preview ? PREVIEW_WIDTH + 40 : 0) >= 640;

  // Chapters: the page reads as a short journey, and the header says which part you are in.
  const [marks, setMarks] = useState<Record<string, number>>({});
  const mark = (key: string) => (y: number) => setMarks((m) => (m[key] === y ? m : { ...m, [key]: y }));
  const chapters = [
    { key: 'top', label: 'Surgical Reps' },
    ...(suggestions.length > 0 ? [{ key: 'next', label: 'Choose your next case' }] : []),
    { key: 'pearl', label: 'Clinical pearl' },
    { key: 'library', label: 'Case library' },
    { key: 'notes', label: 'Educational use' },
  ];
  const starts = useSharedValue<number[]>([]);
  const chapterKey = chapters.map((c) => `${c.key}:${marks[c.key] ?? ''}`).join('|');
  useEffect(() => {
    starts.set(chapters.map((c) => (c.key === 'top' ? 0 : (marks[c.key] ?? Number.POSITIVE_INFINITY))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterKey]);
  const [active, setActive] = useState(0);
  useAnimatedReaction(
    () => {
      const line = scrollY.value + height * 0.42;
      let index = 0;
      for (let i = 0; i < starts.value.length; i++) if ((starts.value[i] ?? Infinity) <= line) index = i;
      return index;
    },
    (now, before) => {
      if (now !== before) scheduleOnRN(setActive, now);
    },
  );

  return (
    <View className="flex-1 flex-row bg-canvas">
      <View className="flex-1">
        <ScrollProvider scrollY={scrollY}>
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
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
              <Chapter id="next" onMark={mark}>
                <Reveal distance={16}>
                <View className="mt-16 gap-2">
                  <View className="items-center gap-2">
                    <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">
                      Matched to your quiz
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
              </Chapter>
            )}

            <Chapter id="pearl" onMark={mark}>
              <View className="mt-14">
                <PearlCarousel />
              </View>
            </Chapter>

            <Chapter id="library" onMark={mark}>
            <Reveal distance={16}>
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
            </Chapter>

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

            <View
              className="mt-14 gap-2 border-t border-line pt-6"
              onLayout={(e) => mark('notes')(e.nativeEvent.layout.y)}
            >
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

        <StickyHeader chapters={chapters} active={Math.min(active, chapters.length - 1)} shown={condensed} />
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
          <Text className="font-ui-bold text-[15px] tracking-[0.6px] text-ink">Surgical Reps</Text>
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
      <View className="flex-row flex-wrap items-center gap-x-5 gap-y-2">
        <ActionButton variant="bracket" label="Tailor cases to your specialty" icon="arrow-right" onPress={open} />
        <Text className="font-data text-[11px] text-ink-faint">3 questions</Text>
      </View>
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
  const scrollY = useScrollY();
  const reduced = useReducedMotion();

  // The title drifts up a little faster than the page and fades out before the header takes over.
  const titleMotion = useAnimatedStyle(() => {
    if (!scrollY || reduced) return {};
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, 260], [1, 0], 'clamp'),
      transform: [{ translateY: interpolate(y, [0, 400], [0, -70], 'clamp') }],
    };
  });

  // A wide, tracked wordmark with the featured plate lit just beneath it.
  const size = wide ? Math.min(132, Math.floor(contentWidth / 9.8)) : Math.min(56, Math.floor(contentWidth / 8.6));
  const leftWidth = wide ? Math.round(contentWidth * 0.5) : contentWidth;
  const rightWidth = wide ? contentWidth - leftWidth - 48 : contentWidth;

  return (
    <View className="mt-6">
      <Animated.View aria-hidden pointerEvents="none" style={titleMotion}>
        <Text
          numberOfLines={1}
          className="font-headline text-ink-muted"
          style={{ fontSize: size, lineHeight: Math.round(size * 1.05), letterSpacing: Math.round(size * 0.06) }}
        >
          SURGICAL REPS
        </Text>
      </Animated.View>

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

          <EcgTrace width={leftWidth} height={56} beats={wide ? 4 : 3} period={11000} />

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
          style={{ width: rightWidth, marginTop: wide ? 8 : 0 }}
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

/** Condensed header: slides in as the hero leaves, and says which chapter of the page you are in. */
function StickyHeader({
  chapters,
  active,
  shown,
}: {
  chapters: { key: string; label: string }[];
  active: number;
  shown: boolean;
}) {
  const insets = useSafeAreaInsets();
  const scrollY = useScrollY();
  const slide = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.value : 0;
    return {
      opacity: interpolate(y, [180, 300], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(y, [180, 300], [-14, 0], 'clamp') }],
    };
  });
  const current = chapters[active];
  return (
    <Animated.View
      pointerEvents={shown ? 'auto' : 'none'}
      style={[{ position: 'absolute', top: 0, left: 0, right: 0 }, slide]}
    >
      <View className="border-b border-line bg-canvas" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between gap-4 px-5 py-2.5">
          <View className="flex-row items-center gap-2.5">
            <Logo size={24} />
            <Text className="hidden font-ui-bold text-[13px] tracking-[0.6px] text-ink sm:flex">Surgical Reps</Text>
          </View>

          <View aria-live="polite" className="flex-1 items-center gap-1.5">
            <ChapterLabel index={active} total={chapters.length} label={current?.label ?? ''} />
            <View className="flex-row gap-1">
              {chapters.map((c, i) => (
                <ChapterTick key={c.key} state={i < active ? 'done' : i === active ? 'here' : 'ahead'} />
              ))}
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <AccountButton />
            <SoundToggle />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/** The chapter name fades out and back in with the new one, so it changes without any sliding. */
function ChapterLabel({ index, total, label }: { index: number; total: number; label: string }) {
  const [text, setText] = useState({ index, label });
  const visible = useSharedValue(1);
  useEffect(() => {
    visible.set(withSequence(withTiming(0, { duration: 120 }), withTiming(1, { duration: 220 })));
    const swap = setTimeout(() => setText({ index, label }), 120);
    return () => clearTimeout(swap);
  }, [index, label, visible]);
  const style = useAnimatedStyle(() => ({ opacity: visible.value }));
  return (
    <Animated.View style={style}>
      <Text numberOfLines={1} className="font-data-medium text-[11px] uppercase tracking-[2px] text-ink">
        <Text className="text-gold">{String(text.index + 1).padStart(2, '0')}</Text>
        <Text className="text-ink-faint"> / {String(total).padStart(2, '0')}  </Text>
        {text.label}
      </Text>
    </Animated.View>
  );
}

/** Measures where a page section begins, so the header knows which chapter you are in. */
function Chapter({ id, onMark, children }: { id: string; onMark: (key: string) => (y: number) => void; children: ReactNode }) {
  return <View onLayout={(e) => onMark(id)(e.nativeEvent.layout.y)}>{children}</View>;
}

/** One short rule per chapter: gold once passed, a longer gold rule for where you are. */
function ChapterTick({ state }: { state: 'done' | 'here' | 'ahead' }) {
  const width = useSharedValue(state === 'here' ? 26 : 12);
  useEffect(() => {
    width.set(withTiming(state === 'here' ? 26 : 12, { duration: 320 }));
  }, [state, width]);
  const style = useAnimatedStyle(() => ({ width: width.value }));
  return (
    <Animated.View
      style={[{ height: 2, backgroundColor: state === 'ahead' ? palette.lineStrong : palette.accent, opacity: state === 'done' ? 0.55 : 1 }, style]}
    />
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
