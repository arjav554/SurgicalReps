/**
 * Who runs Surgical Reps and where its data lives. The legal pages read every business detail from here.
 * `null` means not supplied yet: the pages show a bracketed gap, and `missingOperatorDetails()` lists what the
 * owner still has to fill in before launch. Never guess these values; they come from the owner.
 */
export const OPERATOR = {
  /** Legal name of the person or company responsible for the app and its data (the "data controller"). */
  legalName: null as string | null,
  /** Where people send privacy requests, deletion requests and questions. */
  contactEmail: null as string | null,
  /** Postal address for legal notices. Optional, but expected in some countries (e.g. an EU "Impressum"). */
  postalAddress: null as string | null,
  /** Country or state whose law governs the terms, e.g. "England and Wales" or "the State of California". */
  governingLaw: null as string | null,
  /** Youngest age allowed to use the app. */
  minimumAge: null as number | null,
  /** Date the current versions of the legal pages take effect, e.g. "1 October 2026". */
  effectiveDate: null as string | null,
  /** Public web address of the app, where these pages live for app store listings. */
  webUrl: null as string | null,
  /** Region of the Supabase project (Supabase dashboard → Project Settings → General), e.g. "EU (Frankfurt)". */
  dataRegion: null as string | null,
  /** Company that sends sign-up and password-reset emails (custom SMTP in Supabase), e.g. "Resend". */
  emailProvider: null as string | null,
  /** Company that hosts the web version, e.g. "Expo (EAS Hosting)", or "none" if there is no web version. */
  webHost: null as string | null,
};

const LABELS: Record<keyof typeof OPERATOR, string> = {
  legalName: 'operator legal name',
  contactEmail: 'contact email',
  postalAddress: 'postal address',
  governingLaw: 'governing law',
  minimumAge: 'minimum age',
  effectiveDate: 'effective date',
  webUrl: 'website address',
  dataRegion: 'data region',
  emailProvider: 'email provider',
  webHost: 'web host',
};

/** Details the legal pages need that are still missing. Empty once the owner has filled everything in. */
export function missingOperatorDetails(): string[] {
  return (Object.keys(OPERATOR) as (keyof typeof OPERATOR)[])
    .filter((key) => key !== 'postalAddress' && OPERATOR[key] === null)
    .map((key) => LABELS[key]);
}

/** A detail as it reads on the page: the value, or a visible gap such as "[contact email]". */
export function detail(key: keyof typeof OPERATOR): string {
  const value = OPERATOR[key];
  return value === null ? `[${LABELS[key]}]` : String(value);
}
