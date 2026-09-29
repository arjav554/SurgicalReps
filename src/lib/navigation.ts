import { router, type Href } from 'expo-router';

/** `router.back()` is a no-op on a cold deep link (e.g. a web refresh), so fall back to a known screen. */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
