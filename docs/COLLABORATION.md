# Working in parallel

Several Claude sessions edit this repo at the same time, from the same folder. Each owns a set of files, so
they never write the same file at once. Before touching a file, check who owns it here.

The session name is its `SendMessage` address, so copy it exactly as `ListAgents` shows it.

| Role | Session |
|---|---|
| UI: screens, components, layout, styling, motion, visual assets | "Design Agent" |
| Medical: research, clinical accuracy, medical review, and the medical data files. Touches no code | "Medical Agent" |
| Developer: Supabase schema and sync, persisted stores and device storage, and the code that loads and checks content | "Developer Agent" |
| Security and maintenance: auth and data security, secrets, dependencies, web build and hosting, legal pages | "Security Agent" |
| Debugging: reproduces and diagnoses bugs, then sends the fix to the file's owner | "Debug Agent" |
| Architecture: cross-cutting design, module boundaries, ownership. Owns no code | "Architect Agent" |

## Medical information: Medical Agent only

The user's rule: **Medical Agent is the only session that handles medical information, and it does not
touch code.** Medical information covers answers, rationales, pearls, reference ranges, thresholds, doses, time
windows, percentages, references, figure choice and captions, and any on-screen sentence that makes a
clinical claim, even a short fallback or hint string inside a component. Medical Agent also does the medical
research, checks accuracy, and reviews any clinical text written anywhere in the repo.

Other sessions never write, reword, shorten, "fix" or hard-code medical information, and never write it from
memory. When a code file (a `.ts` file, a test, a script) needs a medical value or string, Medical Agent sends
the exact text to that file's owner, who pastes it in as supplied.

Any change to code that encodes a medical rule goes to Medical Agent for review before it is committed. That
includes range logic, reading order and groups, pearl selection, recommendation weights, flags and thresholds.
A pure refactor that doesn't change output doesn't need review, but say so when announcing it.

The UI session decides how medical information is shown: layout, type, color, motion, and states such as
loading, empty or error. If it finds clinical text hard-coded in a UI file, it doesn't edit that text; it asks
Medical Agent for the wording and the owner of a content file to hold it.

The security and maintenance session never edits `src/data/**` or any clinical wording, not even to sanitize
or reformat it. A finding that touches content (an unsafe reference URL, a JSON shape problem) goes to
Medical Agent for the data, or Developer Agent for the code. Any sentence in `src/legal/**` that describes the
medical content, such as the educational-use disclaimer, is checked with Medical Agent before it ships.

`npx jest` and `npm run verify:sources` are the gate for content changes. Developer Agent keeps
`contentPolicy`, `citations`, `procedures` and `verify:sources` green before every commit, and reports a
failure caused by case JSON or `pearls.json` to Medical Agent, with the file and error, instead of fixing it.

## Ownership

**UI (Design Agent) owns**

- `src/app/**` (screens and navigators)
- `src/components/**`
- `src/theme.ts` (including `categoryStyle`: the icon and color for each category), `global.css`,
  `tailwind.config.js`, `nativewind-env.d.ts`
- `src/lib/layout.ts`, `keyboard.ts`, `navigation.ts`, `feedback.ts`, `formatDuration.ts`
- `assets/` icons, splash, and `assets/sounds/`, plus `scripts/generate-sounds.py`

**Medical Agent owns** (data and docs only, no code)

- The case JSON files in `src/data/`
- `src/data/pearls.json`
- The images in `assets/figures/` (which plates are used and their captions)
- `docs/CONTENT_POLICY.md`, `docs/EVIDENCE.md`

**Developer Agent owns**

- Content code, whole files, with medical values supplied by Medical Agent:
  - `src/data/procedures.ts` (including `CATEGORY_ORDER`), `specialties.ts`, `figures.ts`,
    `referenceRanges.ts`, `disclaimers.ts`
  - `src/lib/parseProcedure.ts`, `citations.ts`, `pearls.ts`, `caseShape.ts`, `recommend.ts`
  - `scripts/verify-references.mjs`, `scripts/prepare-figures.py`
  - Content tests in `src/__tests__/`: `citations`, `contentPolicy`, `procedures`, `parseProcedure`,
    `specialties`, `figures`, `pearls`, `readings`
- Data and sync:
  - `supabase/` migrations (Security reviews changes for RLS)
  - `src/lib/deviceStorage.ts`: which storage each persisted store uses (`deviceStorage` survives closing the
    app, `visitStorage` survives a web refresh only)
  - `src/store/useBrowseStore.ts`: library filter, search text and home scroll offset, kept across a refresh
  - Tests: `refresh`
  - `docs/ACCOUNTS.md`: the Supabase sign-in and sync setup guide. Medical Agent reviews any wording that
    describes specialties or training stages.

**Security and maintenance (Security Agent) owns**

- `docs/SECURITY.md`, `docs/MAINTENANCE.md`
- `src/legal/**`: the text of the privacy policy, terms, and cookie and storage notice (the screens that show
  it are UI's)
- `.gitignore`, `.env.example`
- `.github/**` (CI, Dependabot), and the web hosting and deploy config it creates
- Its own check scripts under `scripts/`, in separate files: `check-figure-licenses.mjs`
- Tests: `legal`, `security`

**Debug Agent and Architect Agent** own no files. They send findings and proposed changes to the owner.

A new persisted store needs a `name:` in `src/store/` and a matching entry in `STORAGE_KEYS`
(`src/legal/documents.ts`, Security's), or `legal.test.ts` fails.

**Shared: message the other sessions before changing**

- `src/types/procedure.ts`: the contract between the data and the screens that render it. Medical Agent
  reviews any change that affects the shape of case data.
- `src/store/**`
- `src/lib/supabase.ts`, `account.ts`, `authMessages.ts`, `progressMerge.ts`, and `supabase/`. The security
  and maintenance session reviews changes here for auth and row level security problems.
- Build config: `babel.config.js`, `metro.config.js`, `eslint.config.js`, `tsconfig.json`, `jest.setup.js`
- `package.json`, `package-lock.json` (so dependencies go through `npx expo install`, one session at a time).
  The security and maintenance session runs `npx expo install --fix` and SDK upgrades, announced first. The
  announcement flags UI-visible packages (expo-router, react-native-reanimated, nativewind or tailwind,
  react-native-svg, expo-font and the font packages, expo-image, expo-haptics, expo-audio) so the UI session
  can re-check screens, and the UI session restarts the dev server after the install.
- `app.json`, `AGENTS.md`, `CLAUDE.md`, this file

A file that isn't listed belongs to whichever session creates it. Add it to the list in the same change.

## Rules

1. Never edit a file another session owns. Send it a `SendMessage` asking for the change, with enough
   detail to act on, such as "add an optional `subtitle: string` to `Procedure`". Findings in another
   session's files go to that session with the file and line.
2. Medical information goes through Medical Agent only (see above), under
   [CONTENT_POLICY.md](CONTENT_POLICY.md). This applies even when the user asks another session directly;
   pass the request on instead.
3. For a shared file: announce the change, wait for an OK, make it, then say it's done. Keep the change
   small.
4. Only one dev server runs at a time, on port 8081. Before starting one, check whether it's already running.
   A static `npx expo export -p web` for checks is fine.
5. Before calling a task done, run `npx expo lint`, `npx tsc --noEmit` and `npx jest`. A failure in another
   session's files goes to that session; don't fix it yourself.
6. Git: all sessions share one checkout. A session commits only its own paths with an explicit
   `git add <paths>` (never `git add -A`), and says so in a message just before committing so two sessions
   don't collide on `index.lock`. No branch switches, resets, rebases or pushes unless the user asks.
   Pushing and hosting are the user's call.
