import { useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';
import { Platform } from 'react-native';

/** Whether this device has a hardware keyboard worth advertising shortcuts for. */
export const KEYBOARD = Platform.OS === 'web';

/**
 * Web keyboard shortcuts. Keys are lower-case `KeyboardEvent.key` values
 * ('a', '1', 'enter', 'r'). Ignored while typing in a field or with modifiers held,
 * and while the owning screen is covered by another one in the stack.
 */
export function useKeyShortcuts(handlers: Record<string, () => void>, enabled = true) {
  const focused = useIsFocused();
  const active = enabled && focused;
  // Always runs the handlers from the latest render without re-binding the listener.
  const run = useEffectEvent((key: string) => {
    const handler = handlers[key];
    if (!handler) return false;
    handler();
    return true;
  });

  useEffect(() => {
    if (!KEYBOARD || !active || typeof window === 'undefined') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (run(event.key.toLowerCase())) event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}

/** a/b/c… and 1/2/3… both map to option position. */
export function optionKeys(count: number, onPick: (position: number) => void): Record<string, () => void> {
  const keys: Record<string, () => void> = {};
  for (let i = 0; i < count; i++) {
    keys[String.fromCharCode(97 + i)] = () => onPick(i);
    keys[String(i + 1)] = () => onPick(i);
  }
  return keys;
}
