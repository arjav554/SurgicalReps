import { describe, expect, it } from '@jest/globals';

import { citationAuthor, citationYear, shortCite } from '@/lib/citations';

describe('short citations', () => {
  it('uses the first author surname', () => {
    expect(citationAuthor('Harter P, Sehouli J, Lorusso D, et al. A Randomized Trial. N Engl J Med. 2019;380(9):822-832.')).toBe('Harter');
  });

  it('uses a group author that precedes the named authors', () => {
    const citation = 'HEALTH Investigators; Bhandari M, Einhorn TA, Guyatt G, et al. Total Hip Arthroplasty. N Engl J Med. 2019;381(23):2199-2208.';
    expect(citationAuthor(citation)).toBe('HEALTH Investigators');
    expect(shortCite({ citation, url: 'https://doi.org/10.1056/NEJMoa1906190', kind: 'trial' })).toBe('HEALTH Investigators 2019');
  });

  it('reads the publication year', () => {
    expect(citationYear('National Institute for Health and Care Excellence. Hip fracture. London: NICE; 2011 (updated 2023).')).toBe('2011');
  });
});
