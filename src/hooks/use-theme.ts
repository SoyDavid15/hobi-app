/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const THEME_KEY = '@hobi-theme';
const listeners: (() => void)[] = [];

let cachedSavedTheme: 'light' | 'dark' | null = null;

function getSavedTheme(): 'light' | 'dark' | null {
  return cachedSavedTheme;
}

export function triggerThemeChange(theme?: 'light' | 'dark') {
  const newTheme = theme ?? getSavedTheme() ?? 'light';
  cachedSavedTheme = newTheme;
  AsyncStorage.setItem(THEME_KEY, newTheme);
  listeners.forEach((listener) => listener());
}

export function useTheme() {
  const systemScheme = useColorScheme();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        cachedSavedTheme = saved;
      }
    });

    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);

    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const savedTheme = cachedSavedTheme;
  const actualTheme = savedTheme ?? systemScheme ?? 'light';
  return Colors[actualTheme === 'dark' ? 'dark' : 'light'];
}