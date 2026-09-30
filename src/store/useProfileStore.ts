import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { normalizeProfile, type SpecialtyChoice, type TrainingStage } from '@/data/specialties';
import { deviceStorage } from '@/lib/deviceStorage';

/** What the onboarding quiz learns about the user; drives recommendations. */
export interface LearnerProfile {
  stage: TrainingStage;
  specialty: SpecialtyChoice;
  /** Other specialties they want to practise, beyond their own. */
  interests: SpecialtyChoice[];
  updatedAt: number;
}

interface ProfileState {
  profile: LearnerProfile | null;
  /** Account id that chose "Skip" after signing in, so the quiz isn't pushed on them again. */
  skippedFor: string | null;
  save: (profile: Omit<LearnerProfile, 'updatedAt'>, at?: number) => void;
  replace: (profile: LearnerProfile | null) => void;
  skip: (accountId: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      skippedFor: null,
      save: (profile, at = Date.now()) => set({ profile: { ...profile, updatedAt: at } }),
      replace: (profile) => set({ profile }),
      skip: (accountId) => set({ skippedFor: accountId }),
    }),
    {
      name: 'mental-reps/profile',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Pick<ProfileState, 'profile' | 'skippedFor'>;
        return version < 2 ? { ...state, profile: state.profile && normalizeProfile(state.profile) } : state;
      },
      storage: createJSONStorage(() => deviceStorage),
      partialize: ({ profile, skippedFor }) => ({ profile, skippedFor }),
    },
  ),
);
