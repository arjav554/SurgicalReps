#!/usr/bin/env node
/**
 * Checks every reference in src/data against the outside world (docs/CONTENT_POLICY.md §2):
 *  - each PMID exists in PubMed, and its title and year match the citation text;
 *  - each DOI resolves at doi.org, and (where Crossref has it) its title matches;
 *  - when a reference has both, PubMed's DOI for that PMID is the same DOI.
 *
 * Usage: npm run verify:sources      (exit code 1 on any failure)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const TITLE_MATCH = 0.7;
const HEADERS = { 'User-Agent': 'mental-reps-reference-check/1.0 (educational app; citation verification)' };

const entries = [];
for (const file of readdirSync(DATA).filter((f) => f.endsWith('.json'))) {
  const json = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  if (!Array.isArray(json.references)) continue;
  json.references.forEach((reference, i) => entries.push({ where: `${file} [${i + 1}]`, reference }));
}

const fold = (text) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const words = (text) =>
  new Set(
    fold(text)
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );

/** PubMed's first author ("de-Madaria E", "CODA Collaborative") reduced to what a citation must contain. */
function firstAuthorKey(record) {
  const author = (record.authors ?? [])[0];
  if (!author?.name) return null;
  if (author.authtype === 'CollectiveName') return fold(author.name).split(/\s+/)[0];
  return fold(author.name.replace(/\s+\S+$/, ''));
}

/** Share of the record's title words that appear in the citation. */
function titleOverlap(title, citation) {
  const t = words(title);
  if (t.size === 0) return 1;
  const c = words(citation);
  let hit = 0;
  for (const w of t) if (c.has(w)) hit++;
  return hit / t.size;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (res.status === 404) return null;
      return await res.json();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await sleep(800 * 2 ** i);
    }
  }
  return null;
}

const failures = [];
const warnings = [];

// PubMed: batch summaries for every PMID.
const pmids = [...new Set(entries.map((e) => e.reference.pmid).filter(Boolean))];
const summaries = {};
for (let i = 0; i < pmids.length; i += 150) {
  const batch = pmids.slice(i, i + 150);
  const data = await getJson(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${batch.join(',')}`,
  );
  Object.assign(summaries, data?.result ?? {});
  await sleep(400);
}

for (const { where, reference } of entries) {
  const { pmid, doi, citation } = reference;
  if (pmid) {
    const record = summaries[pmid];
    if (!record || record.error) {
      failures.push(`${where}: PMID ${pmid} not found in PubMed`);
    } else {
      const overlap = titleOverlap(record.title ?? '', citation);
      if (overlap < TITLE_MATCH) {
        failures.push(`${where}: PMID ${pmid} is "${record.title}" (title match ${(overlap * 100).toFixed(0)}%)`);
      }
      const year = (record.pubdate ?? '').slice(0, 4);
      const epubYear = (record.epubdate ?? '').slice(0, 4);
      if (year && !citation.includes(year) && !(epubYear && citation.includes(epubYear))) {
        warnings.push(`${where}: PubMed year ${year}${epubYear ? ` (epub ${epubYear})` : ''} not in citation`);
      }
      const recordDoi = (record.articleids ?? []).find((a) => a.idtype === 'doi')?.value;
      if (doi && recordDoi && recordDoi.toLowerCase() !== doi.toLowerCase()) {
        failures.push(`${where}: DOI ${doi} but PubMed lists ${recordDoi} for PMID ${pmid}`);
      }
      // Citation details must match the record, not memory: first author, volume, first page.
      const author = firstAuthorKey(record);
      if (author && !fold(citation).includes(author)) {
        failures.push(`${where}: first author in PubMed is "${record.authors[0].name}"`);
      }
      if (record.volume && !new RegExp(`\\b${record.volume}\\b`).test(citation)) {
        failures.push(`${where}: PubMed volume is ${record.volume}`);
      }
      const firstPage = (record.pages ?? '').split(/[-–]/)[0];
      if (firstPage && !citation.includes(firstPage)) {
        warnings.push(`${where}: PubMed pages are ${record.pages}`);
      }
    }
  }
}

// DOIs: resolve at doi.org; compare titles with Crossref where registered there.
const dois = [...new Set(entries.map((e) => e.reference.doi).filter(Boolean))];
const resolved = {};
for (const doi of dois) {
  const handle = await getJson(`https://doi.org/api/handles/${encodeURIComponent(doi)}`);
  resolved[doi] = handle?.responseCode === 1;
  await sleep(150);
}
for (const { where, reference } of entries) {
  const { doi, pmid, citation } = reference;
  if (!doi) continue;
  if (!resolved[doi]) {
    failures.push(`${where}: DOI ${doi} does not resolve at doi.org`);
    continue;
  }
  if (!pmid) {
    const work = await getJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    const title = work?.message?.title?.[0];
    if (title) {
      const overlap = titleOverlap(title, citation);
      if (overlap < TITLE_MATCH) failures.push(`${where}: DOI ${doi} is "${title}" (title match ${(overlap * 100).toFixed(0)}%)`);
    } else {
      warnings.push(`${where}: DOI ${doi} resolves but has no Crossref title to compare`);
    }
    await sleep(150);
  }
}

const noId = entries.filter((e) => !e.reference.pmid && !e.reference.doi);
console.log(
  `Checked ${entries.length} references (${pmids.length} PMIDs, ${dois.length} DOIs, ${noId.length} URL-only).`,
);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const f of failures) console.log(`  FAIL  ${f}`);
if (failures.length > 0) {
  console.log(`${failures.length} reference(s) failed verification.`);
  process.exit(1);
}
console.log('All identifiers resolve and match their citations.');
