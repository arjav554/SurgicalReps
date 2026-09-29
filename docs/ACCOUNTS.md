# Accounts, sync and the specialty quiz

Accounts are optional. Without one, progress and the specialty profile stay on the device, as before.
Signing in backs both up to Supabase and keeps them in sync across devices.

## Turn on sign-in

1. Create a project at [supabase.com](https://supabase.com) (the free tier is enough).
2. In the dashboard, open **SQL Editor**, paste
   [`supabase/migrations/20260928000000_accounts.sql`](../supabase/migrations/20260928000000_accounts.sql) and run it.
   (With the Supabase CLI: `supabase db push`.)
3. Under **Authentication → URL Configuration**, add these redirect URLs so confirmation and
   password-reset emails can return to the app:
   - `http://localhost:8081/**` (web, local development)
   - `mentalreps://**` (iOS and Android builds)
   - your deployed web URL, if you host one
4. Copy `.env.example` to `.env.local` and fill in **Project URL** and the **publishable key**
   (Project Settings → API). Never put the `service_role` / secret key in the app.
5. Restart the dev server (`npx expo start`). `EXPO_PUBLIC_*` values are read at build time.

Email confirmation is on by default in Supabase: new accounts get a link, then sign in.

## How sync works

- Progress is one row per user per procedure (`public.progress`); the quiz answers are one row per user
  (`public.profiles`). Row level security limits every row to its owner.
- On sign-in, progress already on the device (played as a guest) is merged into the account.
  Per procedure, the most recently played record supplies the streak and last outcome; lifetime totals and
  best streak take the larger value; best time takes the faster. Nothing is double counted.
- After each finished case the change is uploaded a moment later, and again whenever the app returns to the
  foreground. Offline runs wait in a local queue (`mental-reps/sync`) and go up on the next sync.
- Signing out uploads anything outstanding, then clears progress and profile from this device (the account
  keeps them). If the upload fails, the app asks before discarding.
- **Delete account** calls `public.delete_own_account()`, which removes the user; their rows cascade.

## Specialty quiz

Three questions: training stage, specialty (current or intended), and optional extra interests. It appears
once after the first sign-in (skippable), and anyone, signed in or not, can take or retake it from the home
screen or the account screen.

What it changes:

- A **For you** tab in the library, selected by default, listing matching cases first, and a **For you** tag on
  matching rows.
- The featured "next rep" is picked from matching cases.
- Clinical pearls from the learner's specialty come up first.
- Students, interns and other clinicians see the shared fundamentals (safety checklist, primary survey,
  central line) ahead of specialty depth.
- Specialties without dedicated cases yet (e.g. orthopaedics) get those fundamentals, and the result screen
  says so plainly.

Cases are filed by specialty in [`src/data/specialties.ts`](../src/data/specialties.ts). A case can train
several specialties; the first one listed is where it is filed in the library. A test fails if a procedure is
added without a specialty.
