/** Form checks and user-facing wording for auth errors. No network code here. */

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailProblem(email: string): string | null {
  if (!email.trim()) return 'Enter your email address.';
  if (!EMAIL.test(email.trim())) return 'That email address doesn’t look right.';
  return null;
}

export function passwordProblem(password: string, creating: boolean): string | null {
  if (!password) return 'Enter your password.';
  if (creating && password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

const BY_CODE: Record<string, string> = {
  invalid_credentials: 'Email or password is incorrect.',
  email_not_confirmed: 'Confirm your email first. The link is in your inbox.',
  user_already_exists: 'An account with this email already exists. Sign in instead.',
  email_exists: 'An account with this email already exists. Sign in instead.',
  weak_password: 'Choose a stronger password.',
  same_password: 'Your new password must be different from the old one.',
  over_email_send_rate_limit: 'Too many emails sent. Wait a minute and try again.',
  over_request_rate_limit: 'Too many attempts. Wait a minute and try again.',
  signup_disabled: 'New accounts are turned off for this project.',
  email_address_invalid: 'That email address can’t be used.',
  session_expired: 'Your session expired. Sign in again.',
  session_not_found: 'Your session expired. Sign in again.',
  otp_expired: 'That link has expired. Request a new one.',
};

/** Map a Supabase error (or anything thrown) to a sentence for the form. */
export function describeAuthError(error: unknown): string {
  if (error && typeof error === 'object') {
    const { code, message, name } = error as { code?: string; message?: string; name?: string };
    if (code && BY_CODE[code]) return BY_CODE[code];
    if (name === 'AuthRetryableFetchError' || /network|fetch/i.test(message ?? '')) {
      return 'Can’t reach the server. Check your connection and try again.';
    }
    if (message) return message;
  }
  return 'Something went wrong. Try again.';
}
