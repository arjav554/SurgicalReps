import { describe, expect, it } from '@jest/globals';

import { parseProcedure } from '@/lib/parseProcedure';

const valid = () => ({
  id: 'demo',
  title: 'Demo',
  description: 'Demo procedure',
  reviewed: '2026-01-15',
  references: [
    { citation: 'Author A. A trial. J Test. 2020;1:1.', url: 'https://doi.org/10.1000/abc', kind: 'trial', pmid: '12345', doi: '10.1000/abc' },
    { citation: 'Society. A guideline. Geneva; 2021.', url: 'https://www.who.int/guideline', kind: 'guideline' },
  ],
  nodes: {
    start: { type: 'info', text: 'Begin', next: 'fork' },
    fork: {
      type: 'chance',
      outcomes: [
        { next: 'ask', weight: 1 },
        { next: 'pick', weight: 1 },
      ],
    },
    ask: {
      type: 'decision',
      text: 'Choose',
      options: [
        { label: 'Right', next: 'win', isCorrect: true, feedback: 'why', cite: [1] },
        { label: 'Wrong', next: 'lose', isCorrect: false, feedback: 'why not', cite: [1, 2] },
      ],
    },
    pick: {
      type: 'multi',
      text: 'Pick all',
      options: [
        { label: 'A', isCorrect: true },
        { label: 'B', isCorrect: true },
        { label: 'C', isCorrect: false },
      ],
      feedback: 'A and B',
      cite: [2],
      next: 'win',
      failNext: 'lose',
    },
    win: { type: 'terminal', status: 'success', text: 'Won', vitals: [{ label: 'HR', value: '80' }] },
    lose: { type: 'terminal', status: 'failure', text: 'Lost' },
  },
});

type Raw = ReturnType<typeof valid> & Record<string, any>;
const broken = (mutate: (p: Raw) => void) => () => {
  const p = valid() as Raw;
  mutate(p);
  return parseProcedure(p);
};

describe('parseProcedure', () => {
  it('accepts a well-formed graph with every node type', () => {
    const p = parseProcedure(valid());
    expect(Object.keys(p.nodes)).toHaveLength(6);
    expect(p.references).toHaveLength(2);
    expect(p.reviewed).toBe('2026-01-15');
    expect(p.objectives).toEqual([]);
  });

  it.each([
    ['dangling next', (p: Raw) => (p.nodes.start.next = 'nowhere'), /unknown node "nowhere"/],
    ['missing entry', (p: Raw) => delete (p.nodes as Record<string, unknown>).start, /missing entry node/],
    ['terminal entry', (p: Raw) => ((p.nodes as any).start = { type: 'terminal', status: 'success', text: 'x' }), /cannot be terminal/],
    ['orphan node', (p: Raw) => ((p.nodes as any).orphan = { type: 'terminal', status: 'success', text: 'x' }), /unreachable/],
    ['no way to win', (p: Raw) => ((p.nodes.win as any).status = 'failure'), /no reachable success/],
    ['unknown type', (p: Raw) => ((p.nodes.start as any).type = 'quiz'), /unknown node type/],
    ['cycle', (p: Raw) => (p.nodes.ask.options[0]!.next = 'start'), /cycle/],
    ['single-outcome chance', (p: Raw) => p.nodes.fork.outcomes.pop(), /2\+ outcomes/],
    ['non-positive weight', (p: Raw) => (p.nodes.fork.outcomes[0]!.weight = 0), /positive number/],
    ['all-correct multi', (p: Raw) => (p.nodes.pick.options[2]!.isCorrect = true), /both correct and incorrect/],
    ['multi without feedback', (p: Raw) => delete (p.nodes.pick as any).feedback, /feedback/],
    ['bad vital status', (p: Raw) => ((p.nodes.win.vitals[0] as any).status = 'bad'), /normal, warning, or critical/],
    ['empty text', (p: Raw) => (p.nodes.start.text = ''), /non-empty string/],
    // Content policy: sources are mandatory and checkable.
    ['rationale without a citation', (p: Raw) => delete (p.nodes.ask.options[0] as any).cite, /must cite/],
    ['multi without a citation', (p: Raw) => delete (p.nodes.pick as any).cite, /pick\.cite/],
    ['empty citation list', (p: Raw) => ((p.nodes.ask.options[1] as any).cite = []), /at least one reference/],
    ['citation out of range', (p: Raw) => ((p.nodes.ask.options[1] as any).cite = [3]), /not a reference number/],
    ['citation of 0', (p: Raw) => ((p.nodes.ask.options[1] as any).cite = [0]), /not a reference number/],
    ['duplicate citation', (p: Raw) => ((p.nodes.ask.options[1] as any).cite = [1, 1]), /cited twice/],
    ['no references at all', (p: Raw) => (p.references = []), /at least one reference/],
    ['reference without a URL', (p: Raw) => delete (p.references[0] as any).url, /url/],
    ['non-https reference URL', (p: Raw) => (p.references[0]!.url = 'http://example.com'), /https/],
    ['unknown evidence kind', (p: Raw) => ((p.references[0] as any).kind = 'blog'), /kind/],
    ['malformed PMID', (p: Raw) => ((p.references[0] as any).pmid = 'PMC123'), /PubMed ID/],
    ['malformed DOI', (p: Raw) => ((p.references[0] as any).doi = 'doi:10.1000'), /not a DOI/],
    ['missing review date', (p: Raw) => delete (p as any).reviewed, /reviewed/],
    ['impossible review date', (p: Raw) => (p.reviewed = '2026-02-30'), /ISO date/],
  ])('rejects %s', (_name, mutate, message) => {
    expect(broken(mutate)).toThrow(message);
  });
});
