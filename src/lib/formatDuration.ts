/** 4.2 s under a minute, m:ss above it. */
export function formatDuration(ms: number): string {
  const seconds = Math.max(0, ms) / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** "just now", "4 min ago", "3 h ago", then a short date. */
export function formatAgo(then: number, now: number): string {
  const minutes = Math.floor(Math.max(0, now - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
