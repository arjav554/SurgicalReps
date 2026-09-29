import { describe, expect, it } from '@jest/globals';

import { procedures } from '@/data/procedures';
import {
  CORE_PROCEDURES,
  PROCEDURE_SPECIALTIES,
  SPECIALTIES,
  SPECIALTY_CHOICES,
  isSpecialtyId,
  normalizeChoice,
  specialtiesOf,
} from '@/data/specialties';
import { collectPearls, orderPearls } from '@/lib/pearls';
import { pickNextRep, recommendedFor, relevance } from '@/lib/recommend';
import type { LearnerProfile } from '@/store/useProfileStore';

const profile = (over: Partial<LearnerProfile>): LearnerProfile => ({
  stage: 'resident',
  specialty: 'general',
  interests: [],
  updatedAt: 0,
  ...over,
});

/** The American College of Surgeons' surgical specialties, in the order the user supplied them. */
const ACS_SECTIONS = [
  'General Surgery',
  'Cardiothoracic Surgery',
  'Colon and Rectal Surgery',
  'Gynecology and Obstetrics',
  'Gynecologic Oncology',
  'Neurological Surgery',
  'Ophthalmic Surgery',
  'Oral and Maxillofacial Surgery',
  'Orthopedic Surgery',
  'Otorhinolaryngology (ENT)',
  'Pediatric Surgery',
  'Plastic and Maxillofacial Surgery',
  'Urology',
  'Vascular Surgery',
];
const MIN_CASES_PER_SECTION = 3;

describe('specialty catalogue', () => {
  const ids = procedures.map((p) => p.id);
  const audiences = new Set(['emergency', 'anesthesiology', 'critical-care']);

  it('has exactly the fourteen ACS sections as library tabs', () => {
    expect(SPECIALTIES.map((s) => s.label)).toEqual(ACS_SECTIONS);
  });

  it('files every procedure under a library section, tagging only known sections and audiences', () => {
    for (const id of ids) {
      const tags = PROCEDURE_SPECIALTIES[id];
      expect([id, tags?.length ?? 0]).not.toEqual([id, 0]);
      expect([id, isSpecialtyId(tags![0]!)]).toEqual([id, true]);
      for (const tag of tags!) expect([id, tag, isSpecialtyId(tag) || audiences.has(tag)]).toEqual([id, tag, true]);
      expect(new Set(tags).size).toBe(tags!.length);
    }
  });

  it('has no mappings or core cases for procedures that do not exist', () => {
    for (const id of [...Object.keys(PROCEDURE_SPECIALTIES), ...CORE_PROCEDURES]) expect(ids).toContain(id);
  });

  it(`files at least ${MIN_CASES_PER_SECTION} cases under every section`, () => {
    const short = SPECIALTIES.map((s) => [s.label, ids.filter((id) => specialtiesOf(id)[0] === s.id).length] as const).filter(
      ([, n]) => n < MIN_CASES_PER_SECTION,
    );
    expect(short).toEqual([]);
  });

  it('maps every quiz choice onto sections or audiences', () => {
    for (const c of SPECIALTY_CHOICES) {
      expect(c.library.length).toBeGreaterThan(0);
      for (const l of c.library) expect(isSpecialtyId(l) || audiences.has(l)).toBe(true);
    }
  });

  it('maps choices from earlier builds onto current ones', () => {
    expect(normalizeChoice('hpb')).toBe('general');
    expect(normalizeChoice('acute-care')).toBe('general');
    expect(normalizeChoice('mis')).toBe('general');
    expect(normalizeChoice('orthopaedics')).toBe('orthopedics');
    expect(normalizeChoice('vascular')).toBe('vascular');
    expect(normalizeChoice('nonsense')).toBe('undecided');
  });
});

describe('recommendations', () => {
  it('scores a case filed under the learner’s specialty highest', () => {
    const general = profile({ specialty: 'general' });
    expect(relevance('lap-chole', general)).toBe(3);
    expect(relevance('acute-diverticulitis', general)).toBe(2);
    const colorectal = profile({ specialty: 'colorectal' });
    expect(relevance('acute-diverticulitis', colorectal)).toBe(3);
    expect(relevance('lap-chole', colorectal)).toBe(0);
    expect(relevance('surgical-safety-checklist', colorectal)).toBe(1);
  });

  it('puts the shared fundamentals first for a medical student', () => {
    const list = recommendedFor(profile({ stage: 'student', specialty: 'general' }), procedures).map((p) => p.id);
    expect(list.slice(0, CORE_PROCEDURES.length).sort()).toEqual([...CORE_PROCEDURES].sort());
    expect(list).toContain('lap-chole');
  });

  it('adds a learner’s interests to their own section', () => {
    const list = recommendedFor(profile({ specialty: 'colorectal', interests: ['general'] }), procedures).map((p) => p.id);
    expect(list[0]).toBe('acute-diverticulitis');
    expect(list).toEqual(expect.arrayContaining([...CORE_PROCEDURES, 'lap-chole']));
  });

  it('matches audiences through the cases tagged for them', () => {
    const next = pickNextRep(procedures, { 'central-line-ij': { attempts: 1, successes: 1, currentStreak: 1, bestStreak: 1, bestTimeMs: 1, lastOutcome: 'success', lastPlayedAt: 1 } }, profile({ specialty: 'critical-care' }));
    expect(specialtiesOf(next.id)).toContain('critical-care');
    expect(next.id).not.toBe('central-line-ij');
  });

  it('falls back to teaching order with no profile', () => {
    expect(pickNextRep(procedures, {}, null).id).toBe(procedures[0]!.id);
  });
});

describe('pearl order', () => {
  const pearls = collectPearls(procedures);

  it('is stable for a seed and floats ranked pearls first', () => {
    const rank = (p: { procedureId: string }) => (p.procedureId === 'trauma-primary-survey' ? 1 : 0);
    const a = orderPearls(pearls, 42, rank);
    expect(orderPearls(pearls, 42, rank)).toEqual(a);
    expect(a).toHaveLength(pearls.length);
    const firstOther = a.findIndex((p) => p.procedureId !== 'trauma-primary-survey');
    expect(a.slice(firstOther).every((p) => p.procedureId !== 'trauma-primary-survey')).toBe(true);
  });
});
