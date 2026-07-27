/**
 * Supabase client singleton. Only constructed when real backends are enabled
 * and configured. Uses AsyncStorage for session persistence (Expo-friendly).
 */
import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!config.supabase.url || !config.supabase.anonKey) return null;
  if (!client) {
    client = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
