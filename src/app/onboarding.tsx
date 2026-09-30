import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { ProcedureRow } from '@/components/home/ProcedureCard';
import { ShortcutHint } from '@/components/simulation/DecisionStep';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { procedures } from '@/data/procedures';
import { QUIZ_NOTICE } from '@/legal/documents';
import {
  SPECIALTY_CHOICES,
  TRAINING_STAGES,
  specialtyChoice,
  trainingStage,
  type SpecialtyChoice,
  type TrainingStage,
} from '@/data/specialties';
import { cue } from '@/lib/feedback';
import { KEYBOARD, optionKeys, useKeyShortcuts } from '@/lib/keyboard';
import { useBreakpoint } from '@/lib/layout';
import { goBack } from '@/lib/navigation';
import { casesFor, recommendedFor } from '@/lib/recommend';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { letterFor } from '@/store/useSimulationStore';
import { palette } from '@/theme';

const QUESTIONS = 3;
/** Pause on a single-choice answer so the selection registers before moving on. */
const ADVANCE_MS = 260;

/** A three-question quiz that tailors the library to the learner's stage and specialty. Always skippable. */
export default function OnboardingScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useBreakpoint();
  const wide = width >= 900;
  const existing = useProfileStore((s) => s.profile);
  const userId = useAuthStore((s) => s.userId);

  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<TrainingStage | null>(existing?.stage ?? null);
  const [specialty, setSpecialty] = useState<SpecialtyChoice | null>(existing?.specialty ?? null);
  const [interests, setInterests] = useState<SpecialtyChoice[]>(existing?.interests ?? []);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  // Single-choice answers advance on their own after a beat.
  useEffect(() => {
    if (pendingStep === null) return;
    const id = setTimeout(() => {
      setStep(pendingStep);
      setPendingStep(null);
    }, ADVANCE_MS);
    return () => clearTimeout(id);
  }, [pendingStep]);

  const finish = () => {
    if (!stage || !specialty) return;
    useProfileStore.getState().save({ stage, specialty, interests: interests.filter((i) => i !== specialty) });
    cue('complete');
    setStep(QUESTIONS);
  };

  const skip = () => {
    useProfileStore.getState().skip(userId);
    if (from === 'signin') router.dismissTo('/');
    else goBack('/');
  };

  const back = () => (step === 0 ? goBack('/') : setStep((s) => s - 1));

  const interestChoices = SPECIALTY_CHOICES.filter((c) => c.id !== specialty && c.id !== 'undecided');

  const pickStage = (position: number) => {
    const choice = TRAINING_STAGES[position];
    if (!choice || pendingStep !== null) return;
    cue('tick');
    setStage(choice.id);
    setPendingStep(1);
  };
  const pickSpecialty = (position: number) => {
    const choice = SPECIALTY_CHOICES[position];
    if (!choice || pendingStep !== null) return;
    cue('tick');
    setSpecialty(choice.id);
    setInterests((list) => list.filter((i) => i !== choice.id));
    setPendingStep(2);
  };
  const toggleInterest = (position: number) => {
    const choice = interestChoices[position];
    if (!choice) return;
    cue('tick');
    setInterests((list) => (list.includes(choice.id) ? list.filter((i) => i !== choice.id) : [...list, choice.id]));
  };

  useKeyShortcuts(
    step === 0
      ? optionKeys(TRAINING_STAGES.length, pickStage)
      : step === 1
        ? optionKeys(SPECIALTY_CHOICES.length, pickSpecialty)
        : step === 2
          ? { ...optionKeys(interestChoices.length, toggleInterest), enter: finish }
          : {},
    step < QUESTIONS,
  );

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        contentContainerStyle={{
          width: '100%',
          maxWidth: 1040,
          alignSelf: 'center',
          paddingHorizontal: wide ? 48 : 20,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 56,
        }}
      >
        <View className="mb-12 gap-4">
          <View className="flex-row items-center gap-4">
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={step === 0 ? 'Close' : 'Previous question'}
              hitSlop={12}
              onPress={step === QUESTIONS ? () => setStep(QUESTIONS - 1) : back}
              className="h-9 w-9 items-center justify-center rounded-sm border border-line"
            >
              <Icon name={step === 0 ? 'close' : 'chevron-left'} size={18} color={palette.inkMuted} />
            </PressableScale>
            <Text className="flex-1 font-data-medium text-[11px] uppercase tracking-[2px] text-ink-faint">
              {step < QUESTIONS ? `Question ${String(step + 1).padStart(2, '0')} / ${String(QUESTIONS).padStart(2, '0')}` : 'Done'}
            </Text>
            {step < QUESTIONS && (
              <PressableScale accessibilityRole="button" cue="tick" tint={false} onPress={skip}>
                <Text className="font-ui text-[13px] text-ink-muted underline">Skip for now</Text>
              </PressableScale>
            )}
          </View>
          <StepRule step={step} />
        </View>

        {step === 0 && (
          <Question
            key="stage"
            split={wide}
            kicker={from === 'signin' ? 'Signed in · one more thing' : 'Tailor your library'}
            title="Where are you in training?"
            hint="Early learners see the shared fundamentals first."
            note={QUIZ_NOTICE}
          >
            <Choices>
              {TRAINING_STAGES.map((s, i) => (
                <ChoiceRow
                  key={s.id}
                  letter={letterFor(i)}
                  label={s.label}
                  detail={s.detail}
                  selected={stage === s.id}
                  onPress={() => pickStage(i)}
                />
              ))}
            </Choices>
          </Question>
        )}

        {step === 1 && (
          <Question
            key="specialty"
            split={wide}
            kicker="Tailor your library"
            title="Which specialty are you in, or aiming for?"
            hint="Matching cases are recommended and listed first. You can change this later."
          >
            <Choices>
              {SPECIALTY_CHOICES.map((c, i) => (
                <ChoiceRow
                  key={c.id}
                  letter={letterFor(i)}
                  label={c.label}
                  detail={choiceDetail(c.id)}
                  selected={specialty === c.id}
                  half={wide}
                  onPress={() => pickSpecialty(i)}
                />
              ))}
            </Choices>
          </Question>
        )}

        {step === 2 && (
          <Question
            key="interests"
            split={wide}
            kicker="Optional"
            title="Anything else you want to practise?"
            hint="Pick any that apply, or none."
          >
            <Choices>
              {interestChoices.map((c, i) => (
                <ChoiceRow
                  key={c.id}
                  letter={letterFor(i)}
                  label={c.label}
                  selected={interests.includes(c.id)}
                  multi
                  half={wide}
                  onPress={() => toggleInterest(i)}
                />
              ))}
            </Choices>
            <View className="mt-8 items-start gap-3">
              <ActionButton
                label={interests.length === 0 ? 'None of these, continue' : `Continue with ${interests.length}`}
                icon="arrow-right"
                shortcut="Enter"
                onPress={finish}
              />
              {KEYBOARD && <ShortcutHint text="Letters toggle · Enter continues" />}
            </View>
          </Question>
        )}

        {step === QUESTIONS && stage && specialty && (
          <Result stage={stage} specialty={specialty} interests={interests} wide={width >= 720} />
        )}
      </ScrollView>
    </View>
  );
}

/** Three plain rules: gold up to the current question, a dim rule for what is still ahead. */
function StepRule({ step }: { step: number }) {
  return (
    <View aria-hidden className="flex-row gap-1.5">
      {Array.from({ length: QUESTIONS }, (_, i) => (
        <View key={i} className="h-[2px] flex-1" style={{ backgroundColor: i <= step ? palette.accent : palette.lineStrong }} />
      ))}
    </View>
  );
}

/** The question on the left (with the privacy note), the answers on the right; one column on phones. */
function Question({
  kicker,
  title,
  hint,
  note,
  split,
  children,
}: {
  kicker: string;
  title: string;
  hint: string;
  note?: string;
  split: boolean;
  children: ReactNode;
}) {
  return (
    <Animated.View entering={FadeIn.duration(260)}>
      <View className={split ? 'flex-row items-start' : ''} style={split ? { gap: 72 } : undefined}>
        <View className={split ? '' : 'mb-8'} style={split ? { width: 340 } : undefined}>
          <View className="gap-3">
            <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">{kicker}</Text>
            <Text accessibilityRole="header" className="font-headline text-[34px] leading-[40px] text-ink lg:text-[42px] lg:leading-[48px]">
              {title}
            </Text>
            <Text className="text-[15px] leading-[23px] text-ink-muted">{hint}</Text>
          </View>
          {note && <Text className="mt-8 border-t border-line pt-4 text-[12px] leading-[18px] text-ink-faint">{note}</Text>}
        </View>
        <View className="flex-1 self-stretch">{children}</View>
      </View>
    </Animated.View>
  );
}

function Choices({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap border-t border-line">{children}</View>;
}

/** One answer as a ruled line: letter, label and detail, and a gold rule and tick when chosen. */
function ChoiceRow({
  letter,
  label,
  detail,
  selected,
  multi = false,
  half = false,
  onPress,
}: {
  letter: string;
  label: string;
  detail?: string;
  selected: boolean;
  multi?: boolean;
  half?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={{ width: half ? '50%' : '100%', paddingRight: half ? 20 : 0 }}>
      <PressableScale
        accessibilityRole={multi ? 'checkbox' : 'radio'}
        aria-checked={selected}
        cue={null}
        rule={!selected}
        onPress={onPress}
        className="border-b border-line"
      >
        <View className="min-h-[60px] flex-row items-center gap-4 py-3 pl-4 pr-2">
          {selected && (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 2, backgroundColor: palette.accent }}
            />
          )}
          <Text className={`w-5 font-data-medium text-[12px] ${selected ? 'text-gold' : 'text-ink-faint'}`}>{letter}</Text>
          <View className="flex-1 gap-0.5">
            <Text className={`text-[15px] leading-[21px] ${selected ? 'font-ui-semibold text-ink' : 'font-ui text-ink'}`}>{label}</Text>
            {detail && <Text className="text-[12px] leading-[17px] text-ink-muted">{detail}</Text>}
          </View>
          {selected && <Icon name="check" size={18} color={palette.accent} />}
        </View>
      </PressableScale>
    </View>
  );
}

/** How many cases train a choice, so the learner knows what they're signing up for. */
function choiceDetail(id: SpecialtyChoice): string | undefined {
  if (id === 'undecided') return 'The fundamentals, then explore';
  const count = casesFor(id, procedures).length;
  return count === 0 ? 'Core cases for now' : `${count} case${count === 1 ? '' : 's'}`;
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function Result({
  stage,
  specialty,
  interests,
  wide,
}: {
  stage: TrainingStage;
  specialty: SpecialtyChoice;
  interests: SpecialtyChoice[];
  wide: boolean;
}) {
  const profile = useProfileStore((s) => s.profile);
  const cases = recommendedFor(profile, procedures);
  const first = cases[0];
  const who = trainingStage(stage).short;
  const choice = specialtyChoice(specialty);
  const headline =
    specialty === 'undecided'
      ? `Set up for ${article(who)} ${who} still choosing.`
      : `Set up for ${article(who)} ${who} in ${choice.label}.`;
  const dek =
    casesFor(specialty, procedures).length === 0 && specialty !== 'undecided'
      ? `There are no dedicated ${choice.label} cases yet, so you’ll start with the fundamentals every surgical team relies on${
          interests.length ? ', plus the areas you picked' : ''
        }.`
      : `${cases.length} cases match. They’re marked in the library and listed first.`;

  return (
    <Animated.View entering={FadeIn.duration(320)}>
      <View className="gap-3">
        <Text className="font-data-medium text-[11px] uppercase tracking-[2px] text-signal">Your library</Text>
        <Text className="font-headline text-[36px] leading-[42px] text-ink lg:text-[48px] lg:leading-[54px]">{headline}</Text>
        <Text className="max-w-[640px] font-display text-[17px] leading-[27px] text-ink-muted">{dek}</Text>
      </View>

      <View className="mt-8 border-t border-line-strong">
        {cases.slice(0, 4).map((p) => (
          <ProcedureRow key={p.id} procedure={p} index={procedures.indexOf(p)} wide={wide} />
        ))}
      </View>

      <View className={`mt-8 gap-3 ${wide ? 'flex-row' : ''}`}>
        {first && (
          <View className={wide ? 'flex-1' : ''}>
            <ActionButton
              label={`Start with ${first.title}`}
              icon="play"
              onPress={() => router.replace({ pathname: '/procedure/[id]', params: { id: first.id } })}
            />
          </View>
        )}
        <View className={wide ? 'flex-1' : ''}>
          <ActionButton label="Go to the library" icon="view-list-outline" variant="ghost" onPress={() => router.dismissTo('/')} />
        </View>
      </View>
    </Animated.View>
  );
}
