import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ipcc-theme';
const DARK = 'dark';
const LIGHT = 'light';

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) return stored;
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
};

export const useDarkMode = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === DARK ? LIGHT : DARK));
  }, []);

  const isDark = theme === DARK;

  return { theme, isDark, toggleTheme };
};
