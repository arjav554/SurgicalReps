import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

import { figureFor } from '@/data/figures';
import { procedures } from '@/data/procedures';

const figuresDir = join(__dirname, '..', '..', 'assets', 'figures');

describe('anatomical figures', () => {
  it('gives every procedure a figure', () => {
    const missing = procedures.filter((p) => !figureFor(p.id)).map((p) => p.id);
    expect(missing).toEqual([]);
  });

  it.each(procedures.map((p) => [p.id]))('%s has a labelled, captioned plate', (id) => {
    const figure = figureFor(id)!;
    expect(figure.label).toMatch(/^(Fig\. \d+|Plate)$/);
    expect(figure.caption.trim().length).toBeGreaterThan(10);
    expect(figure.caption.trim()).toMatch(/\.$/);
    expect(figure.aspect).toBeGreaterThan(0.2);
    expect(figure.aspect).toBeLessThan(5);
  });

  it('ships every plate file that figures.ts names', () => {
    const source = readFileSync(join(__dirname, '..', 'data', 'figures.ts'), 'utf8');
    const files = [...source.matchAll(/assets\/figures\/([\w-]+\.(?:jpg|png))/g)].map((m) => m[1]!);
    expect(files.length).toBeGreaterThan(0);
    expect(files.filter((f) => !existsSync(join(figuresDir, f)))).toEqual([]);
  });
});
