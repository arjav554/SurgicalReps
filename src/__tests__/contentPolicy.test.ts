import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

import { procedures } from '@/data/procedures';
import { citationYear } from '@/lib/citations';
import { DOI_PATTERN, PMID_PATTERN } from '@/lib/parseProcedure';
import type { Procedure } from '@/types/procedure';

/**
 * The sourcing rules in docs/CONTENT_POLICY.md, as tests. The parser already refuses
 * rationales without citations; these cover what a single-file parse cannot see.
 */

const MIN_REFERENCES = 3;
const MAX_REVIEW_AGE_DAYS = 730;

/** Where a reference may point: identifiers, full-text archives, and issuing bodies. */
const SOURCE_HOSTS = new Set([
  'doi.org',
  'pubmed.ncbi.nlm.nih.gov',
  'pmc.ncbi.nlm.nih.gov',
  'www.ncbi.nlm.nih.gov',
  'www.nice.org.uk',
  'www.who.int',
  'iris.who.int',
  'cdn.who.int',
  'www.cdc.gov',
  'www.fda.gov',
  'www.facs.org',
  'www.boa.ac.uk',
  'www.brit-thoracic.org.uk',
  'www.acog.org',
  'www.rcog.org.uk',
  'www.auanet.org',
  'uroweb.org',
  'www.aaos.org',
  'www.aao.org',
  'www.escrs.org',
  'www.entnet.org',
  'www.sign.ac.uk',
  'www.euroburn.org',
]);

/** Primary research must be indexed: it carries a PubMed ID or DOI. */
const RESEARCH_KINDS = new Set(['trial', 'systematic-review', 'cohort', 'classification']);
/** A link into a bibliographic archive implies a journal article, which must carry a PubMed ID or DOI. */
const ARCHIVE_HOSTS = new Set(['doi.org', 'pubmed.ncbi.nlm.nih.gov', 'pmc.ncbi.nlm.nih.gov', 'www.ncbi.nlm.nih.gov']);

const evidenceDoc = readFileSync(join(__dirname, '..', '..', 'docs', 'EVIDENCE.md'), 'utf8');

function citedNumbers(procedure: Procedure): Set<number> {
  const cited = new Set<number>();
  for (const node of Object.values(procedure.nodes)) {
    if (node.type === 'decision') for (const option of node.options) option.cite?.forEach((n) => cited.add(n));
    if (node.type === 'multi') node.cite.forEach((n) => cited.add(n));
    if (node.type === 'info') node.cite?.forEach((n) => cited.add(n));
  }
  return cited;
}

describe('evidence register', () => {
  it('has no unsourced "standard teaching" rows', () => {
    expect(evidenceDoc).not.toMatch(/\|\s*ST\s*\|/);
  });
});

describe.each(procedures.map((p) => [p.id, p] as const))('%s', (id, procedure) => {
  it(`draws on at least ${MIN_REFERENCES} sources, each checkable`, () => {
    expect(procedure.references.length).toBeGreaterThanOrEqual(MIN_REFERENCES);
    for (const [i, reference] of procedure.references.entries()) {
      const where = `${id} [${i + 1}]`;
      const host = new URL(reference.url).hostname;
      expect([where, host, SOURCE_HOSTS.has(host)]).toEqual([where, host, true]);
      if (RESEARCH_KINDS.has(reference.kind) || ARCHIVE_HOSTS.has(host)) {
        expect([where, !!(reference.pmid || reference.doi)]).toEqual([where, true]);
      }
      if (reference.pmid) expect([where, PMID_PATTERN.test(reference.pmid)]).toEqual([where, true]);
      if (reference.doi) {
        expect([where, DOI_PATTERN.test(reference.doi)]).toEqual([where, true]);
        // A DOI link must point at the same DOI the reference declares.
        if (reference.url.startsWith('https://doi.org/')) {
          expect([where, decodeURIComponent(reference.url.slice(16)).toLowerCase()]).toEqual([
            where,
            reference.doi.toLowerCase(),
          ]);
        }
      }
      expect([where, citationYear(reference.citation) !== null]).toEqual([where, true]);
    }
  });

  it('lists no source twice', () => {
    const keys = procedure.references.map((r) => (r.doi ?? r.pmid ?? r.url).toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('cites every reference it lists', () => {
    const cited = citedNumbers(procedure);
    const uncited = procedure.references.map((_, i) => i + 1).filter((n) => !cited.has(n));
    expect([id, uncited]).toEqual([id, []]);
  });

  it('cites a source for every graded decision', () => {
    for (const [nodeId, node] of Object.entries(procedure.nodes)) {
      if (node.type === 'decision') {
        expect([nodeId, node.options.some((o) => (o.cite ?? []).length > 0)]).toEqual([nodeId, true]);
      }
      if (node.type === 'multi') expect([nodeId, node.cite.length > 0]).toEqual([nodeId, true]);
    }
  });

  it(`was checked against its sources within ${MAX_REVIEW_AGE_DAYS / 365} years`, () => {
    const age = (Date.now() - Date.parse(`${procedure.reviewed}T00:00:00Z`)) / 86_400_000;
    expect(age).toBeGreaterThanOrEqual(-1);
    expect(age).toBeLessThanOrEqual(MAX_REVIEW_AGE_DAYS);
  });

  it('has an evidence map in docs/EVIDENCE.md', () => {
    expect(evidenceDoc).toContain(`<a id="${id}"></a>`);
  });
});
