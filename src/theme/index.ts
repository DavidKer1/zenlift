import { Platform, type TextStyle } from 'react-native';

export type ThemeColorScheme = 'light' | 'dark';
export type ThemeMode = ThemeColorScheme | 'system';

// ============================================================
// Monochromatic Tonal Palette — DESIGN.md
//
// Depth via surface layering (no shadows, no gradients).
// Text hierarchy via opacity: 100% → 85% → 50% → 30%
// ============================================================

export const zenliftColors = {
  light: {
    // Surface hierarchy
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F0F0',
    surfaceElevatedDark: '#EBEBEB',
    surfaceSecondary: '#E8E8E8',
    // Text hierarchy
    textPrimary: '#0C0B10',
    textBody: 'rgba(12, 11, 16, 0.87)',
    textSecondary: 'rgba(12, 11, 16, 0.50)',
    textDisabled: 'rgba(12, 11, 16, 0.30)',
    // Actions
    buttonPrimary: '#0C0B10',
    buttonPrimaryText: '#FFFFFF',
    // Outlines
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    // Legacy compatibility (maps old token names → new values)
    primary: '#0C0B10',
    primaryPressed: '#333333',
    primarySoft: '#E0E0E0',
    accent: '#0C0B10',
    success: '#0C0B10',
    warning: '#0C0B10',
    danger: '#0C0B10',
    text: '#0C0B10',
    mutedText: 'rgba(12, 11, 16, 0.50)',
    border: '#CAC4D0',
    backgroundElement: '#F0F0F0',
    backgroundSelected: '#E0E0E0',
  },
  dark: {
    // Surface hierarchy
    background: '#0C0B10',
    surface: '#18191D',
    surfaceElevated: '#242329',
    surfaceElevatedDark: '#1F1E24',
    surfaceSecondary: '#28272F',
    // Text hierarchy
    textPrimary: '#FFFFFF',
    textBody: 'rgba(255, 255, 255, 0.85)',
    textSecondary: 'rgba(255, 255, 255, 0.50)',
    textDisabled: 'rgba(255, 255, 255, 0.30)',
    // Actions
    buttonPrimary: '#FFFFFF',
    buttonPrimaryText: '#0C0B10',
    // Outlines
    outline: '#948E9C',
    outlineVariant: '#49454F',
    // Legacy compatibility (maps old token names → new values)
    primary: '#FFFFFF',
    primaryPressed: '#D9D9D9',
    primarySoft: '#242329',
    accent: '#FFFFFF',
    success: '#FFFFFF',
    warning: '#FFFFFF',
    danger: '#FFFFFF',
    text: '#FFFFFF',
    mutedText: 'rgba(255, 255, 255, 0.50)',
    border: '#49454F',
    backgroundElement: '#18191D',
    backgroundSelected: '#242329',
  },
} as const;

export type ThemeColor = keyof typeof zenliftColors.light & keyof typeof zenliftColors.dark;

// ============================================================
// Typography — DESIGN.md
// Inter for UI, JetBrains Mono for data
// ============================================================

export const fontFamilies = Platform.select({
  ios: {
    sans: 'Inter',
    mono: 'JetBrains Mono',
  },
  android: {
    sans: 'Inter',
    mono: 'JetBrains Mono',
  },
  web: {
    sans: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'Inter',
    mono: 'JetBrains Mono',
  },
});

export const typography = {
  families: fontFamilies,
  // DESIGN.md named styles
  displayLg: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 38.4,
    letterSpacing: -0.64,
  },
  headlineLgMobile: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 33.6,
    letterSpacing: -0.28,
  },
  headlineMd: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.2,
  },
  bodyLg: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: 0,
  },
  dataLg: {
    fontFamily: fontFamilies?.mono ?? 'JetBrains Mono',
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 28.8,
    letterSpacing: -0.48,
  },
  dataMd: {
    fontFamily: fontFamilies?.mono ?? 'JetBrains Mono',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 19.6,
    letterSpacing: 0,
  },
  labelCaps: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 12,
    letterSpacing: 0.6,
  },
  // Legacy backward-compatible accessors for old code using typography.size / .weight / .lineHeight
  get size() {
    return {
      xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32, display: 40,
    };
  },
  get lineHeight() {
    return {
      xs: 16, sm: 20, md: 24, lg: 28, xl: 32, xxl: 40, display: 44,
    };
  },
  get weight() {
    return {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    };
  },
} as const;

// ============================================================
// Spacing — 8px grid with DESIGN.md named values
// ============================================================

export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  marginLateral: 24,
  gutter: 16,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  paddingCard: 20,
} as const;

// ============================================================
// Border Radius — 12px default (rounded-lg)
// ============================================================

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// ============================================================
// Shadows — REMOVED per DESIGN.md (depth via tonal layering)
// Stub kept for backward compatibility; always returns zeroed shadows.
// ============================================================

const NO_SHADOW = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
} as const;

export const shadows = {
  light: { none: NO_SHADOW, sm: NO_SHADOW, md: NO_SHADOW },
  dark: { none: NO_SHADOW, sm: NO_SHADOW, md: NO_SHADOW },
} as const;

// ============================================================
// Theme Tokens Type
// ============================================================

export type ZenliftThemeTokens = {
  colorScheme: ThemeColorScheme;
  colors: (typeof zenliftColors)[ThemeColorScheme];
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows.light;
};

// ============================================================
// Token Factory
// ============================================================

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

