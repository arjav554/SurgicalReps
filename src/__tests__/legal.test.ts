import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { LEGAL_DOCUMENTS, LEGAL_ORDER, STORAGE_KEYS } from '@/legal/documents';
import { detail, missingOperatorDetails, OPERATOR } from '@/legal/operator';

const root = join(__dirname, '..', '..');
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8');

describe('legal documents', () => {
  it('lists every document once, each with a title, summary and non-empty sections', () => {
    expect([...LEGAL_ORDER].sort()).toEqual(Object.keys(LEGAL_DOCUMENTS).sort());
    for (const id of LEGAL_ORDER) {
      const doc = LEGAL_DOCUMENTS[id];
      expect(doc.id).toBe(id);
      expect(doc.title.trim()).not.toBe('');
      expect(doc.summary.trim()).not.toBe('');
      expect(doc.sections.length).toBeGreaterThan(0);
      for (const section of doc.sections) {
        expect(section.heading.trim()).not.toBe('');
        expect(section.body.length).toBeGreaterThan(0);
        for (const block of section.body) {
          const lines = typeof block === 'string' ? [block] : block;
          expect(lines.length).toBeGreaterThan(0);
          for (const line of lines) expect(line.trim()).not.toBe('');
        }
      }
    }
  });

  it('shows a visible gap, never "null", for business details the owner has not supplied', () => {
    const missing = missingOperatorDetails();
    for (const key of Object.keys(OPERATOR) as (keyof typeof OPERATOR)[]) {
      const shown = detail(key);
      if (OPERATOR[key] === null) expect(shown).toMatch(/^\[[a-z ]+\]$/);
      else expect(shown).toBe(String(OPERATOR[key]));
      expect(shown).not.toMatch(/null|undefined/);
    }
    expect(missing.every((label) => /^[a-z ]+$/.test(label))).toBe(true);
  });
});

describe('the cookie and storage notice matches the code', () => {
  it('names exactly the keys the stores persist', () => {
    const storeDir = join(root, 'src', 'store');
    const persisted = readdirSync(storeDir)
      .flatMap((file) => [...readFileSync(join(storeDir, file), 'utf8').matchAll(/\bname:\s*'([^']+)'/g)])
      .map((match) => match[1])
      .sort();
    const listed = STORAGE_KEYS.map((s) => s.key)
      .filter((key) => key.startsWith('mental-reps/'))
      .sort();
    expect(listed).toEqual(persisted);
  });

  it('describes the Supabase session key the client really uses', () => {
    // The notice says "sb-…-auth-token", Supabase's default. A custom storageKey or cookie storage changes that.
    const client = read('src', 'lib', 'supabase.ts');
    expect(client).not.toMatch(/storageKey|cookie/i);
    expect(STORAGE_KEYS.some((s) => s.key === 'sb-…-auth-token')).toBe(true);
  });

  it('stays true that there are no analytics, advertising or tracking SDKs', () => {
    // The privacy policy and cookie notice promise no tracking, and no consent banner exists. Adding any of
    // these needs a consent flow and updated legal text first.
    const pkg = JSON.parse(read('package.json')) as { dependencies?: object; devDependencies?: object };
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const trackers =
      /analytics|^@segment\/|amplitude|mixpanel|posthog|firebase|sentry|bugsnag|^@datadog\/|newrelic|appsflyer|react-native-adjust|react-native-branch|fbsdk|facebook|google-mobile-ads|admob|expo-ads|hotjar|clarity|^react-ga|gtag|onesignal|^@intercom\/|expo-tracking-transparency/i;
    expect(deps.filter((name) => trackers.test(name))).toEqual([]);
  });
});
