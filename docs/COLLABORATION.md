# Working in parallel

Two Claude sessions edit this repo at the same time, from the same folder. Each owns a set of files, so they
never write the same file at once. Before touching a file, check who owns it here.

| Role | Session |
|---|---|
| UI: screens, components, layout, styling, motion, visual assets | "Concurrent chat sessions on SurgeryReps" |
| Content: procedures, references, evidence, and the code that loads them | "Mental-reps Expo app setup" |

## Medical information: content session only

The user's rule: **the content session is the only one that handles medical information.** That covers
answers, rationales, pearls, reference ranges, thresholds, doses, time windows, percentages, references, and
any on-screen sentence that makes a clinical claim, even a short fallback or hint string inside a component.

The UI session decides how medical information is shown: layout, type, color, motion, and states such as
loading, empty or error. It never writes, rewords, shortens, "fixes" or hard-codes the medical information
itself. If a screen needs clinical wording, the content session supplies it in a file it owns, and the UI
renders that text as supplied. If the UI session finds clinical text hard-coded in a UI file, it doesn't edit
that text; it asks the content session to move it into a content-owned file.

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
- Content tests: `citations`, `contentPolicy`, `procedures`, `parseProcedure`, `specialties`

**Shared: message the other session before changing**

- `src/types/procedure.ts`: the contract between the data and the screens that render it
- `src/store/**`
- `src/lib/supabase.ts`, `account.ts`, `authMessages.ts`, `progressMerge.ts`, and `supabase/`
- Build config: `babel.config.js`, `metro.config.js`, `eslint.config.js`, `tsconfig.json`, `jest.setup.js`
- `package.json`, `package-lock.json` (so dependencies go through `npx expo install`, one session at a time)
- `app.json`, `AGENTS.md`, `CLAUDE.md`, this file

A file that isn't listed belongs to whichever session creates it. Add it to the list in the same change.

## Rules

1. Never edit a file the other session owns. Send it a `SendMessage` asking for the change, with enough
   detail to act on, such as "add an optional `subtitle: string` to `Procedure`".
2. Medical information goes through the content session only (see above), under
   [CONTENT_POLICY.md](CONTENT_POLICY.md). This applies even when the user asks the UI session directly;
   pass the request on instead.
3. For a shared file: announce the change, wait for an OK, make it, then say it's done. Keep the change
   small.
4. Only one dev server runs at a time, on port 8081. Before starting one, check whether it's already running.
5. Before calling a task done, run `npx expo lint`, `npx tsc --noEmit` and `npx jest`. A failure in the other
   session's files goes to that session; don't fix it yourself.
