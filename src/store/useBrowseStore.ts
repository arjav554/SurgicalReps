import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { visitStorage } from '@/lib/deviceStorage';

const SCROLL_SAVE_MS = 250;

interface BrowseState {
  /** Library tab the learner picked; null until they pick one (the default then follows their profile). */
  filter: string | null;
  query: string;
  /** Home page scroll offset in px. */
  scrollY: number;
  setFilter: (filter: string | null) => void;
  setQuery: (query: string) => void;
  /** Safe to call on every scroll event: writes are batched. */
  setScrollY: (y: number) => void;
}

let scrollTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Where the learner was on the home page, kept across a page refresh only (session storage):
 * closing the tab starts the next visit from the top.
 */
export const useBrowseStore = create<BrowseState>()(
  persist(
    (set) => ({
      filter: null,
      query: '',
      scrollY: 0,
      setFilter: (filter) => set({ filter }),
      setQuery: (query) => set({ query }),
      setScrollY: (y) => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          scrollTimer = null;
          set({ scrollY: Math.max(0, Math.round(y)) });
        }, SCROLL_SAVE_MS);
      },
    }),
    {
      name: 'mental-reps/browse',
      version: 1,
      storage: createJSONStorage(() => visitStorage),
      partialize: ({ filter, query, scrollY }) => ({ filter, query, scrollY }),
    },
  ),
);
