import { describe, expect, it } from '@jest/globals';

import { describeAuthError, emailProblem, passwordProblem } from '@/lib/authMessages';
import {
  changedIds,
  fromRows,
  mergeProgress,
  mergeRecord,
  newerProfile,
  profileFromRow,
  profileToRow,
  toRow,
} from '@/lib/progressMerge';
import type { LearnerProfile } from '@/store/useProfileStore';
import { EMPTY_PROGRESS, type ProcedureProgress } from '@/store/useProgressStore';

const record = (over: Partial<ProcedureProgress>): ProcedureProgress => ({ ...EMPTY_PROGRESS, ...over });

describe('progress merge', () => {
  it('takes streak and outcome from the most recent play, totals and bests from either', () => {
    const phone = record({ attempts: 5, successes: 3, currentStreak: 0, bestStreak: 2, bestTimeMs: 90_000, lastOutcome: 'failure', lastPlayedAt: 1_000 });
    const laptop = record({ attempts: 4, successes: 4, currentStreak: 3, bestStreak: 3, bestTimeMs: 120_000, lastOutcome: 'success', lastPlayedAt: 2_000 });
    expect(mergeRecord(phone, laptop)).toEqual({
      attempts: 5,
      successes: 4,
      currentStreak: 3,
      bestStreak: 3,
      bestTimeMs: 90_000,
      lastOutcome: 'success',
      lastPlayedAt: 2_000,
    });
  });

  it('does not double count when the device already matches the account', () => {
    const same = record({ attempts: 7, successes: 5, currentStreak: 2, bestStreak: 3, lastPlayedAt: 5 });
    expect(mergeRecord(same, { ...same })).toEqual(same);
  });

  it('keeps successes within attempts and the current streak within the best streak', () => {
    const merged = mergeRecord(
      record({ attempts: 2, successes: 2, currentStreak: 2, bestStreak: 2, lastPlayedAt: 10 }),
      record({ attempts: 9, successes: 1, currentStreak: 0, bestStreak: 1, lastPlayedAt: 5 }),
    );
    expect(merged.successes).toBeLessThanOrEqual(merged.attempts);
    expect(merged.currentStreak).toBeLessThanOrEqual(merged.bestStreak);
  });

  it('unions procedures and reports only rows the server lacks or holds differently', () => {
    const local = { a: record({ attempts: 1, lastPlayedAt: 3 }), b: record({ attempts: 2, lastPlayedAt: 3 }) };
    const remote = { b: record({ attempts: 2, lastPlayedAt: 3 }), c: record({ attempts: 4, lastPlayedAt: 1 }) };
    const merged = mergeProgress(local, remote);
    expect(Object.keys(merged).sort()).toEqual(['a', 'b', 'c']);
    expect(changedIds(merged, remote)).toEqual(['a']);
  });

  it('round-trips through database rows', () => {
    const p = record({ attempts: 3, successes: 2, currentStreak: 1, bestStreak: 2, bestTimeMs: 61_234, lastOutcome: 'success', lastPlayedAt: Date.UTC(2026, 8, 28, 12) });
    expect(fromRows([toRow('user-1', 'lap-chole', p)])).toEqual({ 'lap-chole': p });
  });
});

describe('profile merge', () => {
  const older: LearnerProfile = { stage: 'student', specialty: 'general', interests: [], updatedAt: 100 };
  const newer: LearnerProfile = { stage: 'intern', specialty: 'vascular', interests: ['emergency'], updatedAt: 200 };

  it('keeps the most recently edited profile', () => {
    expect(newerProfile(older, newer)).toBe(newer);
    expect(newerProfile(newer, older)).toBe(newer);
    expect(newerProfile(null, older)).toBe(older);
    expect(newerProfile(null, null)).toBeNull();
  });

  it('round-trips through a database row', () => {
    expect(profileFromRow(profileToRow('user-1', newer))).toEqual(newer);
  });

  it('maps choices saved by earlier builds onto the current sections', () => {
    const row = { ...profileToRow('user-1', newer), specialty: 'hpb', interests: ['mis', 'orthopaedics', 'acute-care', 'gone'] };
    expect(profileFromRow(row as never)).toEqual({ ...newer, specialty: 'general', interests: ['orthopedics'] });
  });
});

describe('auth form checks', () => {
  it('validates email and password', () => {
    expect(emailProblem('')).not.toBeNull();
    expect(emailProblem('resident@')).not.toBeNull();
    expect(emailProblem(' pgy1@hospital.org ')).toBeNull();
    expect(passwordProblem('', false)).not.toBeNull();
    expect(passwordProblem('short', true)).not.toBeNull();
    expect(passwordProblem('short', false)).toBeNull();
    expect(passwordProblem('long-enough', true)).toBeNull();
  });

  it('turns Supabase errors into plain sentences', () => {
    expect(describeAuthError({ code: 'invalid_credentials', message: 'Invalid login credentials' })).toBe(
      'Email or password is incorrect.',
    );
    expect(describeAuthError({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' })).toMatch(/connection/);
    expect(describeAuthError(null)).toMatch(/went wrong/);
  });
});
