import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzwrsqvyxfmgbyekcjxb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6d3JzcXZ5eGZtZ2J5ZWtjanhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDI2ODUsImV4cCI6MjA1ODY3ODY4NX0.2xfEUOwQlAmqaV9qgXthNVASHS_sQ-xdCk2lcThA2Po';

// Custom storage that prevents AsyncStorage from being used during SSR
const customStorage = {
  getItem: async (key: string) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    return AsyncStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 