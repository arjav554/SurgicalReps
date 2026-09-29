import { citedReferences, shortCite } from '@/lib/citations';
import type { Citation, Procedure } from '@/types/procedure';

export interface Pearl {
  procedureId: string;
  procedureTitle: string;
  category: string | undefined;
  prompt: string;
  text: string;
  /** Short attributions for the pearl, e.g. "Di Saverio 2020". */
  sources: string[];
}

function sourcesOf(procedure: Procedure, cite: Citation | undefined): string[] {
  return citedReferences(procedure.references, cite).map(({ reference }) => shortCite(reference));
}

/**
 * Teaching pearls are the evidence rationales already attached to correct answers
 * (and multi-select explanations), so every pearl is sourced content, not filler.
 */
export function collectPearls(procedures: Procedure[]): Pearl[] {
  const pearls: Pearl[] = [];
  for (const procedure of procedures) {
    for (const node of Object.values(procedure.nodes)) {
      if (node.type === 'decision') {
        for (const option of node.options) {
          if (option.isCorrect && option.feedback) {
            pearls.push({
              procedureId: procedure.id,
              procedureTitle: procedure.title,
              category: procedure.category,
              prompt: node.text,
              text: option.feedback,
              sources: sourcesOf(procedure, option.cite),
            });
          }
        }
      }
      if (node.type === 'multi') {
        pearls.push({
          procedureId: procedure.id,
          procedureTitle: procedure.title,
          category: procedure.category,
          prompt: node.text,
          text: node.feedback,
          sources: sourcesOf(procedure, node.cite),
        });
      }
    }
  }
  // De-duplicate rationales shared across case variants.
  const seen = new Set<string>();
  return pearls.filter((p) => (seen.has(p.text) ? false : (seen.add(p.text), true)));
}

/** Small deterministic PRNG (mulberry32), so a given seed always yields the same order. */
function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle by seed, then float higher-ranked pearls (e.g. the learner's specialty) to the front. */
export function orderPearls(pearls: Pearl[], seed: number, rank: (pearl: Pearl) => number): Pearl[] {
  const random = seededRandom(seed);
  const out = [...pearls];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out
    .map((pearl, i) => ({ pearl, i, r: rank(pearl) }))
    .sort((a, b) => b.r - a.r || a.i - b.i)
    .map((x) => x.pearl);
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
