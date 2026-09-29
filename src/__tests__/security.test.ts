import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');

function filesUnder(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path, pattern);
    return pattern.test(name) ? [path] : [];
  });
}

describe('database access rules', () => {
  const migrationsDir = join(root, 'supabase', 'migrations');
  const sql = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(join(migrationsDir, f), 'utf8'))
    .join('\n');

  it('turns on row level security for every table it creates', () => {
    const tables = [...sql.matchAll(/create table (?:if not exists )?public\.(\w+)/gi)].map((m) => m[1]!);
    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(sql).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
    }
  });

  it('never grants table access to signed-out users', () => {
    expect(sql).not.toMatch(/grant [^;]*\bon (?:table )?public\.\w+ to [^;]*\b(anon|public)\b/i);
  });

  it('pins search_path on every security definer function', () => {
    const definers = [...sql.matchAll(/create (?:or replace )?function[\s\S]*?\$\$/gi)]
      .map((m) => m[0])
      .filter((header) => /security definer/i.test(header));
    for (const header of definers) expect(header).toMatch(/set search_path = ''/i);
  });
});

describe('secrets', () => {
  it('keeps server keys out of the app and the example env file', () => {
    const files = [...filesUnder(join(root, 'src'), /\.(ts|tsx|js|json)$/), join(root, '.env.example'), join(root, 'app.json')];
    const secret = /service_role|sb_secret_|SUPABASE_SERVICE|SERVICE_ROLE_KEY|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
    const leaks = files.filter((file) => !file.endsWith('security.test.ts') && secret.test(readFileSync(file, 'utf8')));
    expect(leaks).toEqual([]);
  });

  it('only exposes public values through EXPO_PUBLIC_ variables', () => {
    // Anything named EXPO_PUBLIC_ is bundled into the app where anyone can read it.
    const example = readFileSync(join(root, '.env.example'), 'utf8');
    const names = [...example.matchAll(/^(EXPO_PUBLIC_\w+)=/gm)].map((m) => m[1]);
    expect(names.sort()).toEqual(['EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'EXPO_PUBLIC_SUPABASE_URL']);
  });
});
