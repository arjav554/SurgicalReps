import '../../global.css';

// Per-weight entry points: the package index would bundle every weight of every family.
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono/600SemiBold';
import { IBMPlexSans_400Regular } from '@expo-google-fonts/ibm-plex-sans/400Regular';
import { IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans/500Medium';
import { IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans/600SemiBold';
import { IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans/700Bold';
import { LibreCaslonDisplay_400Regular } from '@expo-google-fonts/libre-caslon-display';
import { LibreCaslonText_400Regular } from '@expo-google-fonts/libre-caslon-text/400Regular';
import { LibreCaslonText_400Regular_Italic } from '@expo-google-fonts/libre-caslon-text/400Regular_Italic';
import { LibreCaslonText_700Bold } from '@expo-google-fonts/libre-caslon-text/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { startAccount } from '@/lib/account';
import { palette } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    LibreCaslonDisplay_400Regular,
    LibreCaslonText_400Regular,
    LibreCaslonText_400Regular_Italic,
    LibreCaslonText_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  // Optional accounts: session tracking and progress sync (a no-op when Supabase isn't configured).
  useEffect(() => startAccount(), []);

  // Hold on the canvas colour until the typefaces are ready (or failed: system fonts then apply).
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: palette.canvas }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.canvas },
          animation: 'fade',
        }}
      />
    </>
  );
}
