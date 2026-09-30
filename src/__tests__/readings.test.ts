import { describe, expect, it } from '@jest/globals';

import { procedures } from '@/data/procedures';
import {
  OBSTETRIC_CASES,
  orderReadings,
  PEDIATRIC_CASES,
  READING_ORDER,
  readingGroup,
  referenceRangeFor,
} from '@/data/referenceRanges';
import type { Vital } from '@/types/procedure';

const allVitals: { id: string; vital: Vital }[] = procedures.flatMap((p) =>
  Object.values(p.nodes).flatMap((node) =>
    'vitals' in node && node.vitals ? node.vitals.map((vital) => ({ id: p.id, vital })) : [],
  ),
);

/** Age in years from a case's opening text, e.g. "A 5-week-old boy" → 5/52. */
function openingAge(text: string): number | undefined {
  const m = text.match(/(\d+)-(year|month|week|day)-old/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return { year: n, month: n / 12, week: n / 52, day: n / 365 }[m[2] as 'year' | 'month' | 'week' | 'day'];
}

describe('monitor readings', () => {
  it('orders and groups every label the cases use', () => {
    const labels = new Set(allVitals.map((v) => v.vital.label));
    expect([...labels].filter((l) => !(READING_ORDER as readonly string[]).includes(l))).toEqual([]);
  });

  it('uses one unit per label across cases', () => {
    const units = new Map<string, Set<string>>();
    for (const { vital } of allVitals) {
      const unit = (vital.unit ?? '').replace(/ nadir$/, '');
      units.set(vital.label, (units.get(vital.label) ?? new Set()).add(unit));
    }
    expect([...units].filter(([, u]) => u.size > 1).map(([l, u]) => [l, [...u]])).toEqual([]);
  });

  it('keeps notes short text qualifiers', () => {
    for (const { id, vital } of allVitals) {
      if (vital.note !== undefined)
        expect([id, vital.note.length > 0 && vital.note.length <= 40]).toEqual([id, true]);
    }
  });

  it('hides adult ranges in every case with a patient under 18', () => {
    const minors = procedures
      .filter((p) => {
        const start = p.nodes.start;
        const age = start && 'text' in start ? openingAge(start.text) : undefined;
        return age !== undefined && age < 18;
      })
      .map((p) => p.id);
    expect(minors.filter((id) => !PEDIATRIC_CASES.has(id))).toEqual([]);
    for (const id of [...PEDIATRIC_CASES, ...OBSTETRIC_CASES]) {
      expect(procedures.some((p) => p.id === id)).toBe(true);
      expect(referenceRangeFor(id, 'HR')).toBeUndefined();
    }
    expect(referenceRangeFor('ruptured-aaa', 'HR')).toMatch(/bpm/);
    expect(referenceRangeFor('ruptured-aaa', 'Since injury')).toBeUndefined();
  });

  it('sorts vital signs first and keeps authored order for ties', () => {
    const sorted = orderReadings([
      { label: 'Lactate' },
      { label: 'SpO2' },
      { label: 'HR' },
      { label: 'GCS' },
    ]);
    expect(sorted.map((r) => r.label)).toEqual(['HR', 'SpO2', 'GCS', 'Lactate']);
    expect(readingGroup('BP')).toBe('vital');
    expect(readingGroup('ICP')).toBe('observation');
    expect(readingGroup('K')).toBe('lab');
  });
});
