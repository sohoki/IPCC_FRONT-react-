import React, { createContext, useContext } from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode.js';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const { isDark, toggleTheme } = useDarkMode();
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
