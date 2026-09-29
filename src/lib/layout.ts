import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

/** Width-driven layout mode: phone < 720 ≤ tablet < 1024 ≤ desktop. */
export function useBreakpoint(): { breakpoint: Breakpoint; width: number; height: number } {
  const { width, height } = useWindowDimensions();
  const breakpoint: Breakpoint = width >= 1024 ? 'desktop' : width >= 720 ? 'tablet' : 'phone';
  return { breakpoint, width, height };
}

/** Animates a displayed integer from its previous value to `target`. */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = Date.now();
    const initial = from.current;
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(initial + (target - initial) * eased);
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
