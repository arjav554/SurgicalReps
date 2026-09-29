import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  soundOn: boolean;
  hapticsOn: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: true,
      hapticsOn: true,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleHaptics: () => set((s) => ({ hapticsOn: !s.hapticsOn })),
    }),
    {
      name: 'mental-reps/settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ soundOn, hapticsOn }) => ({ soundOn, hapticsOn }),
    },
  ),
);
