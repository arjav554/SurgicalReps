import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/store/useSettingsStore';

/** Original cues synthesized by scripts/generate-sounds.py; deliberately quiet. */
const SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  alarm: require('../../assets/sounds/alarm.wav'),
  complete: require('../../assets/sounds/complete.wav'),
} as const;

export type Cue = keyof typeof SOURCES;

const VOLUME: Record<Cue, number> = {
  tap: 0.35,
  tick: 0.3,
  correct: 0.45,
  alarm: 0.5,
  complete: 0.45,
};

const players: Partial<Record<Cue, AudioPlayer>> = {};
let audioModeSet = false;

function playerFor(cue: Cue): AudioPlayer {
  if (!audioModeSet) {
    audioModeSet = true;
    // Respect the iOS silent switch and never interrupt the user's own audio.
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }
  let player = players[cue];
  if (!player) {
    player = createAudioPlayer(SOURCES[cue]);
    player.volume = VOLUME[cue];
    players[cue] = player;
  }
  return player;
}

const HAPTIC: Record<Cue, () => Promise<void>> = {
  tap: () => Haptics.selectionAsync(),
  tick: () => Haptics.selectionAsync(),
  correct: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  alarm: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  complete: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

/** Play a UI cue with its matching haptic, honouring the user's sound and haptics settings. */
export function cue(name: Cue) {
  const { soundOn, hapticsOn } = useSettingsStore.getState();
  if (soundOn) {
    try {
      const player = playerFor(name);
      player.seekTo(0);
      player.play();
    } catch {
      // Audio is a nicety; never let it break the simulation.
    }
  }
  if (hapticsOn && Platform.OS !== 'web') {
    HAPTIC[name]().catch(() => {});
  }
}
