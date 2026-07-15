import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const SUPABASE_URL = Constants.expoConfig.extra.supabaseUrl;
const SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;

const REFRESH_TOKEN_KEY = 'supabase.refresh-token';

const customStorage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(key, value);
      return;
    }
    if (key.endsWith('refresh_token') || key === REFRESH_TOKEN_KEY) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch {
        // SecureStore may reject if value exceeds size limit
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // fallback silently
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // key may not exist
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});