import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeName, themes } from '../lib/themes';

interface ThemeContextType {
  activeTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeColors: typeof themes.cozy;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeName>('cozy');

  const setTheme = (theme: ThemeName) => {
    setActiveTheme(theme);
  };

  const themeColors = themes[activeTheme];

  const value = {
    activeTheme,
    setTheme,
    themeColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
