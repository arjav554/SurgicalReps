# Working in parallel

Three Claude sessions edit this repo at the same time, from the same folder. Each owns a set of files, so they
never write the same file at once. Before touching a file, check who owns it here.

| Role | Session |
|---|---|
| UI: screens, components, layout, styling, motion, visual assets | "Concurrent chat sessions on SurgeryReps" |
| Content: procedures, references, evidence, and the code that loads them | "Mental-reps Expo app setup" |
| Security and maintenance: auth and data security, secrets, dependencies, web build and hosting, legal pages | "Surgeryreps security and maintenance" |

## Medical information: content session only

The user's rule: **the content session is the only one that handles medical information.** That covers
answers, rationales, pearls, reference ranges, thresholds, doses, time windows, percentages, references, and
any on-screen sentence that makes a clinical claim, even a short fallback or hint string inside a component.

The UI session decides how medical information is shown: layout, type, color, motion, and states such as
loading, empty or error. It never writes, rewords, shortens, "fixes" or hard-codes the medical information
itself. If a screen needs clinical wording, the content session supplies it in a file it owns, and the UI
renders that text as supplied. If the UI session finds clinical text hard-coded in a UI file, it doesn't edit
that text; it asks the content session to move it into a content-owned file.

The security and maintenance session never edits `src/data/**` or any clinical wording, not even to sanitize
or reformat it. A finding that touches content (an unsafe reference URL, a JSON shape problem) goes to the
content session as a message. Any sentence in `src/legal/**` that describes the medical content, such as the
educational-use disclaimer, is checked with the content session before it ships.

## Ownership

**UI owns**

- `src/app/**` (screens and navigators)
- `src/components/**`
- `src/theme.ts` (including `categoryStyle`: the icon and color for each category the content session
  names), `global.css`, `tailwind.config.js`, `nativewind-env.d.ts`
- `src/lib/layout.ts`, `keyboard.ts`, `navigation.ts`, `feedback.ts`, `formatDuration.ts`
- `assets/` icons, splash, and `assets/sounds/`, plus `scripts/generate-sounds.py`

**Content owns**

- Everything in `src/data/`: case JSON, `procedures.ts` (including `CATEGORY_ORDER`), `specialties.ts`, and
  `referenceRanges.ts`
- `docs/CONTENT_POLICY.md`, `docs/EVIDENCE.md`, `docs/ACCOUNTS.md`
- `src/lib/parseProcedure.ts`, `citations.ts`, `pearls.ts`, `caseShape.ts`, `recommend.ts`
- `assets/figures/` and `scripts/prepare-figures.py`, `scripts/verify-references.mjs`
- Content tests: `citations`, `contentPolicy`, `procedures`, `parseProcedure`, `specialties`. Other sessions
  message the content session before changing any of them.

**Security and maintenance owns**

- `docs/SECURITY.md`, `docs/MAINTENANCE.md`
- `src/legal/**`: the text of the privacy policy, terms, and cookie and storage notice (the screens that show
  it are UI's)
- `.gitignore`, `.env.example`
- `.github/**` (CI, Dependabot), and the web hosting and deploy config it creates
- Its own check scripts under `scripts/`, in separate files (`verify-references.mjs` and `prepare-figures.py`
  stay with content)

**Shared: message the other sessions before changing**

- `src/types/procedure.ts`: the contract between the data and the screens that render it
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
2. Medical information goes through the content session only (see above), under
   [CONTENT_POLICY.md](CONTENT_POLICY.md). This applies even when the user asks the UI session directly;
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
