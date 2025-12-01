/**
 * useTheme Hook
 * Custom hook for managing theme state (light/dark)
 */

import { useState, useEffect } from 'react';
import type { Theme } from '@/types';

export interface UseThemeOptions {
  initialTheme?: Theme;
  storageKey?: string;
  onThemeChange?: (theme: Theme) => void;
}

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = ({
  initialTheme = 'light',
  storageKey = 'gitboard-theme',
  onThemeChange,
}: UseThemeOptions = {}): UseThemeReturn => {
  // Initialize theme from localStorage or initialTheme
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return initialTheme;
  });

  // Update localStorage and call callback when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, theme);
    }

    if (onThemeChange) {
      onThemeChange(theme);
    }

    // Update document class for global styling
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme, storageKey, onThemeChange]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};
