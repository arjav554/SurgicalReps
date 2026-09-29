import { normalizeProfile, type SpecialtyChoice, type TrainingStage } from '@/data/specialties';
import type { LearnerProfile } from '@/store/useProfileStore';
import type { ProcedureProgress } from '@/store/useProgressStore';
import type { TerminalStatus } from '@/types/procedure';

export type ProgressMap = Record<string, ProcedureProgress>;

/** One row of the `progress` table (see supabase/migrations). */
export interface ProgressRow {
  user_id: string;
  procedure_id: string;
  attempts: number;
  successes: number;
  current_streak: number;
  best_streak: number;
  best_time_ms: number | null;
  last_outcome: TerminalStatus | null;
  last_played_at: string | null;
}

export function toRow(userId: string, procedureId: string, p: ProcedureProgress): ProgressRow {
  return {
    user_id: userId,
    procedure_id: procedureId,
    attempts: p.attempts,
    successes: p.successes,
    current_streak: p.currentStreak,
    best_streak: p.bestStreak,
    best_time_ms: p.bestTimeMs === null ? null : Math.round(p.bestTimeMs),
    last_outcome: p.lastOutcome,
    last_played_at: p.lastPlayedAt === null ? null : new Date(p.lastPlayedAt).toISOString(),
  };
}

export function fromRows(rows: ProgressRow[]): ProgressMap {
  const out: ProgressMap = {};
  for (const row of rows) {
    const playedAt = row.last_played_at === null ? null : Date.parse(row.last_played_at);
    out[row.procedure_id] = {
      attempts: row.attempts,
      successes: row.successes,
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      bestTimeMs: row.best_time_ms,
      lastOutcome: row.last_outcome,
      lastPlayedAt: playedAt === null || Number.isNaN(playedAt) ? null : playedAt,
    };
  }
  return out;
}

function minTime(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

/**
 * Combine two records of the same procedure without double counting.
 * The most recently played record supplies the streak and last outcome;
 * lifetime totals and bests take the larger (or faster) of the two.
 */
export function mergeRecord(a: ProcedureProgress, b: ProcedureProgress): ProcedureProgress {
  const newer = (a.lastPlayedAt ?? 0) >= (b.lastPlayedAt ?? 0) ? a : b;
  return {
    ...newer,
    attempts: Math.max(a.attempts, b.attempts),
    successes: Math.max(a.successes, b.successes),
    bestStreak: Math.max(a.bestStreak, b.bestStreak, newer.currentStreak),
    bestTimeMs: minTime(a.bestTimeMs, b.bestTimeMs),
  };
}

export function mergeProgress(local: ProgressMap, remote: ProgressMap): ProgressMap {
  const out: ProgressMap = { ...remote };
  for (const [id, record] of Object.entries(local)) {
    const other = out[id];
    out[id] = other ? mergeRecord(record, other) : record;
  }
  return out;
}

export function sameRecord(a: ProcedureProgress | undefined, b: ProcedureProgress | undefined): boolean {
  if (!a || !b) return a === b;
  return (
    a.attempts === b.attempts &&
    a.successes === b.successes &&
    a.currentStreak === b.currentStreak &&
    a.bestStreak === b.bestStreak &&
    a.bestTimeMs === b.bestTimeMs &&
    a.lastOutcome === b.lastOutcome &&
    a.lastPlayedAt === b.lastPlayedAt
  );
}

/** Procedure ids whose merged record differs from what the server holds. */
export function changedIds(merged: ProgressMap, remote: ProgressMap): string[] {
  return Object.keys(merged).filter((id) => !sameRecord(merged[id], remote[id]));
}

export function totalRuns(map: ProgressMap): number {
  return Object.values(map).reduce((sum, p) => sum + p.attempts, 0);
}

/** One row of the `profiles` table. */
export interface ProfileRow {
  user_id: string;
  training_stage: TrainingStage;
  specialty: SpecialtyChoice;
  interests: SpecialtyChoice[];
  updated_at: string;
}

export function profileToRow(userId: string, p: LearnerProfile): ProfileRow {
  return {
    user_id: userId,
    training_stage: p.stage,
    specialty: p.specialty,
    interests: p.interests,
    updated_at: new Date(p.updatedAt).toISOString(),
  };
}

export function profileFromRow(row: ProfileRow | null): LearnerProfile | null {
  if (!row) return null;
  const at = Date.parse(row.updated_at);
  return normalizeProfile({
    stage: row.training_stage,
    specialty: row.specialty,
    interests: row.interests ?? [],
    updatedAt: Number.isNaN(at) ? 0 : at,
  });
}

/** The more recently edited profile wins. */
export function newerProfile(a: LearnerProfile | null, b: LearnerProfile | null): LearnerProfile | null {
  if (!a) return b;
  if (!b) return a;
  return a.updatedAt >= b.updatedAt ? a : b;
}
