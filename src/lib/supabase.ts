import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Inlined by Expo at build time; set them in .env.local (see docs/ACCOUNTS.md).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * The Supabase client, or null when this build has no project configured.
 * Accounts are optional: without a client the app keeps progress on the device only.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // On web the confirmation and password-reset links land on the page itself.
          detectSessionInUrl: Platform.OS === 'web',
        },
      })
    : null;
