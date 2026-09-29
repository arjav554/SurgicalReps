import { expect, it } from '@jest/globals';

import { formatDuration } from '@/lib/formatDuration';

it.each([
  [0, '0.0 s'],
  [4_250, '4.3 s'],
  [59_940, '59.9 s'],
  [60_000, '1:00'],
  [125_400, '2:05'],
  [-50, '0.0 s'],
])('formats %d ms as %s', (ms, expected) => {
  expect(formatDuration(ms)).toBe(expected);
});
