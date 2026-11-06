import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorTokens, lightColors, darkColors } from './colors';
import { typography, textVariants } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { elevations } from './elevation';

export interface Theme {
  isDark: boolean;
  colors: ColorTokens;
  typography: typeof typography;
  textVariants: typeof textVariants;
  spacing: typeof spacing;
  radii: typeof radii;
  elevations: typeof elevations;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  const isDark = useMemo(() => {
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const value: Theme = useMemo(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      typography,
      textVariants,
      spacing,
      radii,
      elevations,
      setThemeMode,
      themeMode,
    }),
    [isDark, themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './elevation';

