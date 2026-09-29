import {
  CORE_PROCEDURES,
  isSpecialtyId,
  specialtiesOf,
  specialtyChoice,
  type SpecialtyChoice,
  type SpecialtyId,
} from '@/data/specialties';
import type { LearnerProfile } from '@/store/useProfileStore';
import { EMPTY_PROGRESS, isMastered, type ProcedureProgress } from '@/store/useProgressStore';
import type { Procedure } from '@/types/procedure';

/** Stages that should see the shared fundamentals before specialty depth. */
const EARLY_STAGES = new Set(['student', 'intern', 'other']);

/**
 * How relevant a case is to this learner: 3 when filed under their own specialty,
 * 2 when it also trains their specialty, 1 for a stated interest or a shared fundamental, 0 otherwise.
 */
export function relevance(procedureId: string, profile: LearnerProfile | null): number {
  if (!profile) return 0;
  const tags = specialtiesOf(procedureId);
  const own = specialtyChoice(profile.specialty).library;
  if (own.includes(tags[0]!)) return 3;
  if (tags.some((t) => own.includes(t))) return 2;
  const interests = profile.interests.flatMap((i) => specialtyChoice(i).library);
  if (tags.some((t) => interests.includes(t))) return 1;
  if (CORE_PROCEDURES.includes(procedureId)) return 1;
  return 0;
}

export function isRecommended(procedureId: string, profile: LearnerProfile | null): boolean {
  return relevance(procedureId, profile) > 0;
}

/**
 * Cases for this learner, most relevant first. Early learners meet the shared
 * fundamentals first; otherwise teaching order breaks ties.
 */
export function recommendedFor(profile: LearnerProfile | null, all: Procedure[]): Procedure[] {
  if (!profile) return [];
  const early = EARLY_STAGES.has(profile.stage);
  return all
    .map((p, order) => ({ p, order, score: relevance(p.id, profile) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (early) {
        const coreA = CORE_PROCEDURES.includes(a.p.id) ? 1 : 0;
        const coreB = CORE_PROCEDURES.includes(b.p.id) ? 1 : 0;
        if (coreA !== coreB) return coreB - coreA;
      }
      return b.score - a.score || a.order - b.order;
    })
    .map((x) => x.p);
}

/**
 * The featured "next rep": among the learner's cases (or all, with no profile),
 * anything unstarted first, then the weakest and least recently practised.
 */
export function pickNextRep(
  all: Procedure[],
  byProcedure: Record<string, ProcedureProgress>,
  profile: LearnerProfile | null,
): Procedure {
  const pool = profile ? recommendedFor(profile, all) : all;
  const candidates = pool.length > 0 ? pool : all;
  const fresh = candidates.find((p) => !byProcedure[p.id]?.attempts);
  if (fresh) return fresh;
  return [...candidates].sort((a, b) => {
    const pa = byProcedure[a.id] ?? EMPTY_PROGRESS;
    const pb = byProcedure[b.id] ?? EMPTY_PROGRESS;
    return (
      Number(isMastered(pa)) - Number(isMastered(pb)) ||
      pa.currentStreak - pb.currentStreak ||
      (pa.lastPlayedAt ?? 0) - (pb.lastPlayedAt ?? 0)
    );
  })[0]!;
}

/** Library sections that match this learner (own specialty, then interests), for the "For you" line. */
export function librarySpecialtiesFor(profile: LearnerProfile | null): SpecialtyId[] {
  if (!profile) return [];
  const ids = [profile.specialty, ...profile.interests].flatMap((c) => specialtyChoice(c).library).filter(isSpecialtyId);
  return [...new Set(ids)];
}

/** Cases that train a quiz choice directly (filed under it, or tagged for it). */
export function casesFor(choice: SpecialtyChoice, all: Procedure[]): Procedure[] {
  if (choice === 'undecided') return [];
  const library = specialtyChoice(choice).library;
  return all.filter((p) => specialtiesOf(p.id).some((t) => library.includes(t)));
}
