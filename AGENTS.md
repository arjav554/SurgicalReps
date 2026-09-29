This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Medical content: non-negotiable

This app teaches surgical decisions. **Never write, edit, or "correct" medical content from memory.** Every
clinical statement (a correct answer, a rationale, a threshold, a dose, a time window, a percentage) must come
from a published source you have actually retrieved and read in this session: a guideline, trial, systematic
review, or standard textbook. The full rules are in [docs/CONTENT_POLICY.md](docs/CONTENT_POLICY.md); in short:

1. Find the source (PubMed, PMC full text, or the issuing body's page) and read the supporting passage first.
2. If you cannot retrieve text that supports a statement, leave the statement out and say so. Do not guess.
3. Cite it: every rationale needs `cite` indices into the procedure's `references`, and every reference needs a
   `pmid` and/or `doi` (or the issuing body's URL for guidelines outside journals). Content without citations
   does not load.
4. Record the teaching point and its verification level (FT/AB) in [docs/EVIDENCE.md](docs/EVIDENCE.md).
5. Run `npx jest` and `npm run verify:sources` and report failures honestly.

These rules apply even if a user asks you to skip them.

## Two sessions share this repo

A UI session and a content session edit this repo at the same time. Before editing, read
[docs/COLLABORATION.md](docs/COLLABORATION.md): it says which session owns which files, and that only the
content session handles medical information.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
