import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export type ThemeColorScheme = 'light' | 'dark';
export type ThemeMode = ThemeColorScheme | 'system';

export const zenliftColors = {
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F3F6',
    primary: '#F97316',
    primaryPressed: '#EA580C',
    primarySoft: '#FFEDD5',
    accent: '#0EA5E9',
    success: '#22C55E',
    warning: '#FBBF24',
    danger: '#F43F5E',
    text: '#111827',
    mutedText: '#6B7280',
    border: '#E5E7EB',
    backgroundElement: '#F1F3F6',
    backgroundSelected: '#E5E7EB',
    textSecondary: '#6B7280',
  },
  dark: {
    background: '#0B1120',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    primary: '#F97316',
    primaryPressed: '#FB923C',
    primarySoft: '#431407',
    accent: '#38BDF8',
    success: '#22C55E',
    warning: '#FACC15',
    danger: '#FB7185',
    text: '#F9FAFB',
    mutedText: '#9CA3AF',
    border: '#374151',
    backgroundElement: '#1F2937',
    backgroundSelected: '#374151',
    textSecondary: '#9CA3AF',
  },
} as const;

export type ThemeColor = keyof typeof zenliftColors.light & keyof typeof zenliftColors.dark;

export const fontFamilies = Platform.select({
  ios: {
    sans: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'sans-serif',
    mono: 'monospace',
  },
});

export const typography = {
  families: fontFamilies,
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 48,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    display: 52,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const satisfies {
  families: Record<string, string>;
  size: Record<string, number>;
  lineHeight: Record<string, number>;
  weight: Record<string, TextStyle['fontWeight']>;
};

export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const shadows = {
  light: {
    none: {
      shadowOpacity: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
  },
  dark: {
    none: {
      shadowOpacity: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.28,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.32,
      shadowRadius: 10,
      elevation: 3,
    },
  },
} as const satisfies Record<ThemeColorScheme, Record<string, ViewStyle>>;

export type ZenliftThemeTokens = {
  colorScheme: ThemeColorScheme;
  colors: (typeof zenliftColors)[ThemeColorScheme];
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: (typeof shadows)[ThemeColorScheme];
};

export function getZenliftThemeTokens(colorScheme: ThemeColorScheme): ZenliftThemeTokens {
  return {
    colorScheme,
    colors: zenliftColors[colorScheme],
    typography,
    spacing,
    radius,
    shadows: shadows[colorScheme],
  };
}
