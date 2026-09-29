import type { Citation, Reference } from '@/types/procedure';

/** Year of publication: the first year that follows a journal/publisher separator (". 2020;" or "; 2018."). */
export function citationYear(citation: string): string | null {
  const match = citation.match(/[.;]\s*((?:19|20)\d{2})(?=[\s;.:(,]|$)/);
  return match ? match[1]! : null;
}

/** "Podda M, et al. …" → "Podda"; "CODA Collaborative. …" → "CODA Collaborative". */
export function citationAuthor(citation: string): string {
  const authors = citation.split(/\.\s/)[0] ?? citation;
  // A group author may precede the named authors: "HEALTH Investigators; Bhandari M, ...".
  const first = (authors.split(/[,;]/)[0] ?? authors).trim();
  const surname = first.replace(/\s+[A-Z]{1,3}$/, '');
  return surname.length > 34 ? `${surname.slice(0, 32).trimEnd()}…` : surname;
}

/** Short label for inline attribution, e.g. "Di Saverio 2020". */
export function shortCite(reference: Reference): string {
  const year = citationYear(reference.citation);
  return year ? `${citationAuthor(reference.citation)} ${year}` : citationAuthor(reference.citation);
}

/** The references a statement cites, in citation order; unknown numbers are skipped. */
export function citedReferences(references: Reference[], cite: Citation | undefined): { n: number; reference: Reference }[] {
  return (cite ?? [])
    .map((n) => ({ n, reference: references[n - 1] }))
    .filter((x): x is { n: number; reference: Reference } => x.reference !== undefined);
}
