#!/usr/bin/env node
/**
 * Checks the copyright status of every figure source listed in scripts/prepare-figures.py, using the
 * Wikimedia Commons API. Passes only for public-domain or CC0 files; anything else (CC BY, CC BY-SA,
 * fair use, unknown) needs a decision and attribution before it ships, so it fails.
 *
 * Usage (from the project root): node scripts/check-figure-licenses.mjs
 * Read-only: it doesn't change any file.
 */
import { readFileSync } from 'node:fs';

const SCRIPT = 'scripts/prepare-figures.py';
const OK = /^(public domain|pd\b|pd-|cc0)/i;

const source = readFileSync(SCRIPT, 'utf8');
const block = source.match(/SOURCES\s*=\s*\{([\s\S]*?)\n\}/);
if (!block) {
  console.error(`Couldn't find the SOURCES table in ${SCRIPT}.`);
  process.exit(2);
}
const files = [...block[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)].map(([, key, name]) => ({ key, name }));

async function lookup(names) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'extmetadata',
    iiextmetadatafilter: 'LicenseShortName|Artist|Credit',
    titles: names.map((n) => `File:${n}`).join('|'),
  }).toString();
  const res = await fetch(url, { headers: { 'User-Agent': 'MentalReps-license-check/1.0' } });
  if (!res.ok) throw new Error(`Commons API returned ${res.status}`);
  const json = await res.json();
  const byTitle = new Map();
  const norm = (t) => t.replace(/^File:/, '').replace(/_/g, ' ');
  for (const n of json.query.normalized ?? []) byTitle.set(norm(n.to), norm(n.from));
  const out = new Map();
  for (const page of Object.values(json.query.pages)) {
    const meta = page.imageinfo?.[0]?.extmetadata ?? {};
    const text = (k) => (meta[k]?.value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const title = norm(page.title);
    out.set(byTitle.get(title) ?? title, { missing: 'missing' in page, license: text('LicenseShortName'), artist: text('Artist') });
  }
  return out;
}

const results = new Map();
for (let i = 0; i < files.length; i += 50) {
  const batch = files.slice(i, i + 50);
  for (const [name, info] of await lookup(batch.map((f) => f.name.replace(/_/g, ' ')))) results.set(name, info);
}

let failures = 0;
for (const { key, name } of files) {
  const info = results.get(name.replace(/_/g, ' '));
  const license = info?.missing ? 'not found on Commons' : info?.license || 'no license recorded';
  const ok = !info?.missing && OK.test(license);
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${key.padEnd(14)} ${name}  —  ${license}${info?.artist ? `  (${info.artist.slice(0, 60)})` : ''}`);
}
console.log(`\n${files.length - failures} of ${files.length} figure sources are public domain or CC0.`);
if (failures > 0) {
  console.log('Anything marked FAIL needs a licence decision and on-screen attribution before it ships.');
  process.exit(1);
}
