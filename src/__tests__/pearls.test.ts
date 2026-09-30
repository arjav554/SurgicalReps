import { describe, expect, it } from '@jest/globals';

import { procedures } from '@/data/procedures';
import { collectPearls, EXTRA_PEARLS } from '@/lib/pearls';

describe('standalone pearls', () => {
  it.each(EXTRA_PEARLS.map((p, i) => [i + 1, p.procedureId, p] as const))(
    'pearl %i (%s) belongs to a case and cites its references',
    (_, id, pearl) => {
      const procedure = procedures.find((p) => p.id === id);
      expect(procedure).toBeDefined();
      expect(pearl.prompt.trim()).toMatch(/\?$/);
      expect(pearl.text.trim().length).toBeGreaterThan(40);
      expect(pearl.cite.length).toBeGreaterThan(0);
      for (const n of pearl.cite) {
        expect([n, n >= 1 && n <= procedure!.references.length]).toEqual([n, true]);
      }
    },
  );

  it('adds every standalone pearl to the collection', () => {
    const texts = new Set(collectPearls(procedures).map((p) => p.text));
    expect(EXTRA_PEARLS.filter((p) => !texts.has(p.text))).toEqual([]);
  });
});
