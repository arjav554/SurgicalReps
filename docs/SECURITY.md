# Security, privacy and legal risk

Owned by the security and maintenance session. Last full review: 29 September 2026.

This is an engineering review, not legal advice. The legal pages in `src/legal/` are drafts written to match
what the code does. Have a lawyer in your country review them before launch, especially if you charge money,
form a company, or market to users in the EU or UK.

## What the app does with data (verified in code and in the running web build)

| Where | What | Leaves the device? |
|---|---|---|
| Device storage (`mental-reps/progress`, `/profile`, `/settings`, `/sync`) | Case results, quiz answers, sound and haptics, sync queue | No, unless signed in |
| Supabase `auth.users` | Email, hashed password, sign-in logs (IP address, user agent) | Yes, with an account |
| Supabase `public.progress`, `public.profiles` | Per-case results; training stage, specialty, interests | Yes, with an account |
| Outbound links | Reference links open journals and guideline sites | Only when tapped |

On 29 September 2026 the web build loaded nothing from any third-party host, set no cookies, embedded no
iframes, and had no analytics, advertising or tracking SDKs. Fonts are bundled, not fetched from Google.
`src/__tests__/legal.test.ts` fails if a tracking SDK is added or the storage keys drift from the cookie notice.

## Checks that run with `npx jest`

- `security.test.ts`: every table in `supabase/migrations` has row level security; no table is granted to
  `anon` or `public`; every `security definer` function pins `search_path`; no server key (`service_role`,
  `sb_secret_`, private keys) appears in `src/`, `app.json` or `.env.example`.
- `legal.test.ts`: legal pages are well-formed; the storage notice matches the persisted store names; the
  Supabase session key matches the default; no tracking SDK in `package.json`.

Run by hand:

- `node scripts/check-figure-licenses.mjs` checks every figure source in `scripts/prepare-figures.py` on
  Wikimedia Commons and fails on anything that isn't public domain or CC0. 42 of 42 passed on 29 September 2026.
- `npm audit`: see dependencies below.

## Findings

| # | Severity | Finding | Where | Status |
|---|---|---|---|---|
| 1 | High (launch blocker) | Supabase's built-in email only delivers to the project team's own addresses, at 2 per hour, so strangers can't confirm sign-ups or reset passwords. Set up custom SMTP. [Supabase docs](https://supabase.com/docs/guides/auth/auth-smtp) | Supabase dashboard | Owner action |
| 2 | High (launch blocker) | No privacy policy, terms or storage notice. Apple (5.1.1(i)) requires a privacy policy link in the store listing and inside the app. Google Play requires one too. | App | Drafts in `src/legal/`; screen and links requested from the Design session |
| 3 | High (launch blocker) | Business details (operator name, contact email, governing law, minimum age, data region, email provider, web host, effective date) are unknown, so the legal pages show bracketed gaps | `src/legal/operator.ts` | Owner action |
| 4 | Medium | Google Play also requires a web page where people can request account deletion without the app. The hosted privacy policy covers this (email request) once the web version is live. [Play policy](https://support.google.com/googleplay/android-developer/answer/13327111) | Hosting | Needs `webUrl` |
| 5 | Medium | `LICENSE` is Expo's template MIT licence, "Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)". It names the wrong owner, and if the repo is ever published it would license your code and content to everyone under MIT. | `LICENSE` | Owner decision |
| 6 | Medium | Account screen says "Only you can read your records". Row level security stops other users, but the operator and Supabase can access the database, so the claim overstates it. | `src/app/account.tsx:110` | Sent to Design session |
| 7 | Medium | Contrast failures (WCAG 2.2 AA): `ink-faint` text 2.84–3.42:1 (needs 4.5:1, 43 uses); red text on raised surfaces 3.82–4.35:1; danger button label 3.42:1; input borders 1.57–1.88:1 (needs 3:1) | `src/theme.ts`, `tailwind.config.js`, `ActionButton.tsx`, `TextField.tsx` | Sent to Design session |
| 8 | Low | Error notices aren't announced to screen readers; Enter in the email field does nothing when signing in | `src/app/account.tsx:140`, `:256` | Sent to Design session |
| 9 | Low | A plain `.env` file wasn't git-ignored | `.gitignore` | Fixed |
| 10 | Low | 13 moderate `npm audit` advisories, all transitive: `decode-uri-component` via expo-router → query-string (malformed-URL denial of service in the user's own tab), and `uuid` via Expo's build tooling (build time only). Neither is exploitable here; both need upstream Expo releases. `npm audit fix --force` would break the SDK. | `package-lock.json` | Watch; recheck on SDK upgrades |
| 11 | Info | Row level security, owner-only policies, `(select auth.uid())`, and the `delete_own_account` function (revoked from `anon`, `search_path = ''`) are sound. No secrets in git history. Repo has no remote. | `supabase/migrations` | OK |

## Before launch: owner checklist

1. Fill in `src/legal/operator.ts`. Every `null` shows as a gap such as `[contact email]` on the legal pages.
2. Supabase → Authentication:
   - Set up custom SMTP (Resend, Postmark, AWS SES…) and put the provider's name in `emailProvider`.
   - Keep email confirmation on. Set the minimum password length to at least 8 to match the app.
   - Add the redirect URLs in `docs/ACCOUNTS.md`, including the deployed web URL.
   - Supabase's [data processing agreement](https://supabase.com/legal/dpa) takes effect when you accept its
     terms; keep a copy. Check that your email provider offers one too.
3. Decide on `LICENSE` (see finding 5): usually "All rights reserved" under your name for a closed app.
4. Hosting: serve over HTTPS with HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
   strict-origin-when-cross-origin`, and `frame-ancestors 'none'` (stops the site being framed for
   clickjacking). Add a Content Security Policy once the host is chosen and the Supabase URL is known.
5. Store listings: link the privacy policy URL; fill in Apple's privacy "nutrition label" and Google Play's
   Data safety form from the table above (email, user ID, app interactions; not used for tracking; not sold).
6. Check the name "Surgical Reps" isn't already a trademark in your market before spending on
   branding.
7. Lawyer review of `src/legal/` (see the top of this file).

## Which laws are likely to matter

Only the owner knows where they are based and where users are, so this is a starting point, not an answer.

- **EU/UK GDPR** applies if you offer the app to people in the EU or UK. Needs: the Article 13 information
  (covered in the privacy policy once details are filled in), a lawful basis (contract, plus legitimate
  interests for security logs), deletion within one month on request, and a processor agreement with Supabase
  and the email provider.
- **Cookie and storage rules (ePrivacy, UK PECR)** cover browser local storage as well as cookies. Items
  strictly necessary for a service the user asked for (sign-in, saving their progress, preferences) are exempt
  from consent. Analytics and advertising are not. The app uses only exempt storage, so **no consent banner is
  needed today**. Adding analytics, ads, or third-party embeds changes that.
  [ICO](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/09/fact-vs-fiction-ico-debunks-myths-on-storage-and-access-technologies),
  [WP29 Opinion 04/2012](https://www.hoganlovells.com/en/publications/article-29-working-party-publishes-opinion-on-cookie-consent-exemptions)
- **California CalOPPA** applies to any site or app collecting personal information from California
  residents. It requires a posted policy with categories collected, third parties, how to review or correct
  data, how changes are notified, an effective date, and how Do Not Track is handled. All are in the draft.
  [Bus. & Prof. Code 22575](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22575)
- **CCPA/CPRA** applies only above $25M revenue (inflation-adjusted), 100,000 California consumers, or 50% of
  revenue from selling data. It is unlikely to apply to a free app.
  [CA Attorney General](https://oag.ca.gov/privacy/ccpa)
- **Children (COPPA and similar)**: the app isn't aimed at children, and the terms set a minimum age. Don't
  market to under-13s.
- **Accessibility**: US ADA lawsuits over websites are common, and courts and the DOJ look to WCAG. Fixing
  finding 7 brings the main flows much closer to WCAG 2.2 AA.
- **App store rules**: Apple 5.1.1(v) in-app account deletion is done. Apple 1.4.1 asks medical apps to remind
  users to check with a doctor before making medical decisions. The terms say so, and the content session
  supplies a visible in-app line as `CLINICAL_DISCLAIMER` in `src/data/disclaimers.ts` for the UI to place.
  [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Health data rules (HIPAA and similar)** don't apply, because the app never collects patient information.
  The terms forbid entering it and there's no field for it. Keep it that way.

## Content and images

- Anatomical plates: Gray's Anatomy (1918), published before 1931 so public domain in the US, and marked
  public domain on Wikimedia Commons. The app credits them (`src/data/figures.ts`). Run the licence check
  whenever plates are added.
- App icon, splash and Android icons: origin not recorded. Confirm you made them or have the rights.
- Fonts (IBM Plex, Libre Caslon) are under the SIL Open Font License 1.1, and the icons are Material Design
  Icons under [Apache 2.0](https://pictogrammers.com/docs/general/license/). Both allow bundling in an app.
  Apache 2.0 expects its licence text to travel with redistributed copies, so add an "Open-source licences"
  page before store release.
- Cited papers and guidelines belong to their publishers. The app links to them. Rationales should stay in
  the app's own words rather than copying guideline text or figures (content session).
- No reviews, testimonials, ratings, user counts or outcome claims were found in the UI. Keep it that way
  unless they're real and verifiable.
