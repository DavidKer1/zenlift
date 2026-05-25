import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { createMMKV } from 'react-native-mmkv';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getZenliftThemeTokens,
  type ThemeColorScheme,
  type ThemeMode,
  type ZenliftThemeTokens,
} from '@/theme';

const THEME_MODE_STORAGE_KEY = 'zenlift.theme.mode';

const themeStorage = createMMKV({
  id: 'zenlift-settings',
});

type ZenliftThemeContextValue = ZenliftThemeTokens & {
  mode: ThemeMode;
  resolvedMode: ThemeColorScheme;
  isDark: boolean;
  navigationTheme: NavigationTheme;
  setMode: (mode: ThemeMode) => void;
};

const ZenliftThemeContext = createContext<ZenliftThemeContextValue | null>(null);

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getStoredThemeMode(): ThemeMode {
  const storedMode = themeStorage.getString(THEME_MODE_STORAGE_KEY);

  return isThemeMode(storedMode) ? storedMode : 'dark';
}

function resolveThemeMode(mode: ThemeMode, systemScheme: string | null | undefined): ThemeColorScheme {
  if (mode !== 'system') {
    return mode;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}

function createNavigationTheme(tokens: ZenliftThemeTokens): NavigationTheme {
  const baseTheme = tokens.colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: tokens.colorScheme === 'dark',
    colors: {
      ...baseTheme.colors,
      primary: tokens.colors.primary,
      background: tokens.colors.background,
      card: tokens.colors.surface,
      text: tokens.colors.textPrimary,
      border: tokens.colors.outlineVariant,
      notification: tokens.colors.danger,
    },
    fonts: baseTheme.fonts,
  };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(getStoredThemeMode);

  const setMode = useCallback((nextMode: ThemeMode) => {
    themeStorage.set(THEME_MODE_STORAGE_KEY, nextMode);
    setModeState(nextMode);
  }, []);

  const value = useMemo<ZenliftThemeContextValue>(() => {
    const resolvedMode = resolveThemeMode(mode, systemScheme);
    const tokens = getZenliftThemeTokens(resolvedMode);

    return {
      ...tokens,
      mode,
      resolvedMode,
      isDark: resolvedMode === 'dark',
      navigationTheme: createNavigationTheme(tokens),
      setMode,
    };
  }, [mode, setMode, systemScheme]);

  return <ZenliftThemeContext.Provider value={value}>{children}</ZenliftThemeContext.Provider>;
}

export function useZenliftTheme() {
  const context = useContext(ZenliftThemeContext);

  if (!context) {
    throw new Error('useZenliftTheme must be used within ThemeProvider');
  }

  return context;
}
