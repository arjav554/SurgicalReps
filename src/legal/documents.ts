import { detail, OPERATOR } from '@/legal/operator';

/**
 * The privacy policy, terms of use, and cookie and storage notice, as data the legal screen renders.
 * Every statement here describes what the code actually does; `legal.test.ts` checks the storage keys and
 * the no-tracking claims against the source. Change the code and this text together.
 *
 * A section body is a list of blocks: a string is a paragraph, a string array is a bulleted list.
 */
export type LegalBlock = string | string[];

export interface LegalSection {
  heading: string;
  body: LegalBlock[];
}

export type LegalDocId = 'privacy' | 'terms' | 'cookies';

export interface LegalDocument {
  id: LegalDocId;
  title: string;
  /** One or two plain sentences shown above the sections. */
  summary: string;
  sections: LegalSection[];
}

const operator = detail('legalName');
const email = detail('contactEmail');
const minimumAge = detail('minimumAge');

/** Keys the app writes to device storage (browser localStorage on web). Checked against src/store in tests. */
export const STORAGE_KEYS = [
  { key: 'mental-reps/progress', purpose: 'Your results for each case: runs, successes, streaks and best time.' },
  { key: 'mental-reps/profile', purpose: 'Your specialty quiz answers, if you took the quiz.' },
  { key: 'mental-reps/settings', purpose: 'Whether sound and haptics are on.' },
  { key: 'mental-reps/sync', purpose: 'With an account: which results still need uploading.' },
  { key: 'mental-reps/run', purpose: 'The case you have open, so a refresh doesn’t restart it. Cleared when you close the tab.' },
  { key: 'mental-reps/browse', purpose: 'Your library filter, search text and scroll position. Cleared when you close the tab.' },
  { key: 'sb-…-auth-token', purpose: 'With an account: keeps you signed in on this device.' },
] as const;

const privacy: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  summary:
    'Surgical Reps works without an account, and then nothing you do leaves your device. If you create an account, we keep your email address, progress and specialty profile so they sync between devices. We don’t use analytics, advertising or trackers, and we don’t sell your data.',
  sections: [
    {
      heading: 'Who we are',
      body: [
        `Surgical Reps is run by ${operator}, who is responsible for your personal data (the "data controller"). Contact: ${email}.${
          OPERATOR.postalAddress ? ` Post: ${OPERATOR.postalAddress}.` : ''
        }`,
      ],
    },
    {
      heading: 'Without an account',
      body: [
        'Your progress, specialty quiz answers and settings are saved on your device only (in your browser’s local storage on the web). They are not sent to us. The cookie and storage notice lists exactly what is saved.',
      ],
    },
    {
      heading: 'With an account',
      body: [
        'Accounts are optional. If you create one, we collect:',
        [
          'Your email address, to sign you in and to send account emails (confirmation and password reset). We don’t send marketing email.',
          'Your password, which our sign-in provider stores only in hashed form. We can’t see it.',
          'Your progress for each case: attempts, successes, current and best streak, best time, last outcome, and when you last played.',
          'Your specialty profile, if you take the optional quiz: training stage, specialty and extra interests.',
          'Technical information every web request carries, such as your IP address and browser or device type, which our providers process to run sign-in and protect it from abuse.',
        ],
        'When you sign in, progress already on your device is added to your account.',
        'We never ask for patient information. Please don’t enter any.',
      ],
    },
    {
      heading: 'How we use it, and why we’re allowed to',
      body: [
        [
          'To provide your account, sync your progress and tailor recommendations to your profile. This is necessary to provide the service you asked for (a contract, under UK and EU data protection law).',
          'To keep the service secure and prevent abuse, using technical information. This is in our legitimate interest in running a safe service.',
        ],
        'We don’t use your data for advertising, sell it, or share it for cross-site tracking. We don’t make automated decisions about you that have legal or similarly significant effects.',
      ],
    },
    {
      heading: 'Who processes it for us',
      body: [
        'We share data only with providers that run the service for us, under contracts that require them to protect it:',
        [
          'Supabase: account sign-in and database. Data is stored in the ' + detail('dataRegion') + ' region.',
          `${detail('emailProvider')}: sends account emails.`,
          ...(OPERATOR.webHost !== 'none' ? [`${detail('webHost')}: hosts the web version.`] : []),
        ],
        'We may also disclose data if the law requires it. If data is transferred outside your country, we rely on safeguards such as standard contractual clauses in our providers’ data processing agreements.',
        'Reference links in the app open other sites, such as journals and guideline publishers, which have their own privacy policies.',
      ],
    },
    {
      heading: 'How long we keep it',
      body: [
        'We keep account data until you delete your account. Deleting it removes your account, progress and profile from our database straight away. Copies in our provider’s routine backups and security logs are removed when those expire.',
        'Data on your device stays until you clear it. Signing out removes your progress and profile from that device; your account keeps them.',
      ],
    },
    {
      heading: 'Deleting your account',
      body: [
        'In the app, open Account and choose Delete account. If you can’t use the app, email ' +
          email +
          ' from the address on your account and we’ll delete it for you.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'Depending on where you live, you can ask us to give you a copy of your data, correct it, delete it, restrict or object to how we use it, or send it to you in a portable format. Email ' +
          email +
          '. We reply within one month. We won’t treat you differently for using these rights.',
        'If you’re in the UK or EU, you can also complain to your data protection authority (in the UK, the Information Commissioner’s Office).',
      ],
    },
    {
      heading: 'Security',
      body: [
        'Data travels over encrypted connections. Database rules let each signed-in user read and change only their own records, and the app never contains server secret keys. No system is perfectly secure, so if you find a problem, please tell us at ' +
          email +
          '.',
      ],
    },
    {
      heading: 'Tracking and Do Not Track',
      body: [
        'Surgical Reps doesn’t track you across other sites or apps, and it doesn’t let third parties collect information about your activity over time. Because there is no such tracking to turn off, the app works the same way whether or not your browser sends a Do Not Track signal.',
      ],
    },
    {
      heading: 'Children',
      body: [
        `Surgical Reps is for medical students and clinicians and isn’t directed at children. You must be at least ${minimumAge} to create an account. If we learn we hold a child’s data, we delete it.`,
      ],
    },
    {
      heading: 'Changes to this policy',
      body: [
        `This policy takes effect on ${detail('effectiveDate')}. If we make a significant change, we’ll show a notice in the app before it applies and update this date.`,
      ],
    },
  ],
};

const terms: LegalDocument = {
  id: 'terms',
  title: 'Terms of Use',
  summary: `These terms are an agreement between you and ${operator}, who runs Surgical Reps. By using the app, you accept them.`,
  sections: [
    {
      heading: 'Educational use only',
      body: [
        'Surgical Reps is a training tool for practicing surgical decision-making. It is not medical advice and not a clinical decision aid. Don’t use it to diagnose or treat patients, or in place of your own clinical judgment, supervision by qualified colleagues, or your institution’s protocols.',
        'Cases are simplified teaching scenarios. We cite published sources, but medicine changes and content can contain errors or go out of date. Check current guidance before making any clinical decision.',
      ],
    },
    {
      heading: 'Who can use it',
      body: [
        `You must be at least ${minimumAge}. If you create an account, give a real email address, keep your password to yourself, and tell us at ${email} if you think someone else has used your account.`,
      ],
    },
    {
      heading: 'Acceptable use',
      body: [
        'Don’t:',
        [
          'Enter patient information or other people’s personal data.',
          'Try to access other people’s accounts or data, or get around the app’s security.',
          'Overload, disrupt or scrape the service, or use automated means to access it in bulk.',
          'Use the app for anything unlawful.',
        ],
        'We may suspend or close an account that breaks these rules.',
      ],
    },
    {
      heading: 'Ownership',
      body: [
        `The app’s design, code and original text belong to ${operator}, except where a separate license says otherwise. You may use them for your own learning, but not copy or republish them. Cited articles and guidelines belong to their publishers. The anatomical plates come from Gray’s Anatomy (1918), which is in the public domain.`,
      ],
    },
    {
      heading: 'Price and refunds',
      body: [
        'Surgical Reps is free. We don’t take payments, so there is nothing to refund. If we ever offer paid features, we’ll publish their price and refund terms before you can buy them. Purchases made through the App Store or Google Play would also be covered by those stores’ refund processes.',
      ],
    },
    {
      heading: 'Availability and changes',
      body: [
        'We provide the app as it is and as available. We may change, pause or stop it, or any case in it. If we stop the service, we’ll give notice in the app where we can, so you have time to delete your account.',
      ],
    },
    {
      heading: 'Liability',
      body: [
        'As far as the law allows, we aren’t liable for indirect or consequential loss, or for any decision made using the app. Nothing in these terms limits liability that the law doesn’t allow us to limit, such as for death or personal injury caused by negligence, or for fraud. If you use the app as a consumer, you keep all the rights consumer law gives you.',
      ],
    },
    {
      heading: 'Ending',
      body: [
        'You can stop using the app at any time and delete your account from the Account screen.',
      ],
    },
    {
      heading: 'Law and changes to these terms',
      body: [
        `These terms are governed by the law of ${detail('governingLaw')}, without taking away protections the law where you live gives you. They take effect on ${detail('effectiveDate')}. If we make a significant change, we’ll show a notice in the app before it applies.`,
        `Questions: ${email}.`,
      ],
    },
  ],
};

const cookies: LegalDocument = {
  id: 'cookies',
  title: 'Cookie and Storage Notice',
  summary:
    'Surgical Reps doesn’t use cookies. It saves a few items in your device’s storage so the app works, and nothing for analytics or advertising. That’s why there’s no consent banner.',
  sections: [
    {
      heading: 'What we store on your device',
      body: [
        'On the web this is your browser’s local storage; in the mobile apps, the app’s own storage. Most items are kept until you clear them or uninstall the app. The two marked “Cleared when you close the tab” live in your browser’s session storage and are never uploaded.',
        STORAGE_KEYS.map(({ key, purpose }) => `${key}: ${purpose}`),
      ],
    },
    {
      heading: 'Why we don’t ask for consent',
      body: [
        'Privacy laws such as the UK and EU rules on cookies and similar technologies let a service store items without asking first when they are strictly necessary for something you asked for: keeping you signed in, saving the progress you make, and remembering your settings and where you were. Everything above falls into that group.',
        'We don’t use analytics, advertising, social media plug-ins or other third-party trackers. If we ever add anything that isn’t strictly necessary, we’ll ask for your consent first and update this notice.',
      ],
    },
    {
      heading: 'Clearing it',
      body: [
        'Signing out removes your progress and profile from this device. To remove everything, clear this site’s data in your browser settings, or uninstall the app.',
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = { privacy, terms, cookies };

/** Order for footers and link lists. */
export const LEGAL_ORDER: LegalDocId[] = ['privacy', 'terms', 'cookies'];

/**
 * The line under the sign-up form. Render `terms` and `privacy` as links to /legal/terms and
 * /legal/privacy. Accounts are provided under the terms (a contract), so this is a notice, not a
 * consent checkbox.
 */
export const SIGN_UP_NOTICE = {
  before: 'By creating an account, you agree to the ',
  terms: 'Terms of Use',
  middle: ' and confirm you’ve read the ',
  privacy: 'Privacy Policy',
  after: '.',
} as const;

/** The line on the specialty quiz, explaining where the answers go. */
export const QUIZ_NOTICE =
  'Optional. Your answers are used only to tailor what the app shows you first. They stay on this device, and in your account if you’re signed in.';
