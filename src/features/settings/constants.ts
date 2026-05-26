import type { ThemeMode } from '@/theme';

export const SETTINGS_MMKV_ID = 'zenlift-settings';

export const SETTINGS_KEYS = {
  weightUnit: 'zenlift.settings.weight_unit',
  themeMode: 'zenlift.settings.theme_mode',
  weeklyGoal: 'zenlift.settings.weekly_goal',
  onboardingCompleted: 'zenlift.settings.onboarding_completed',
} as const;

export const LEGACY_THEME_MODE_KEY = 'zenlift.theme.mode';

export type WeightUnit = 'kg' | 'lb';

export const DEFAULT_SETTINGS = {
  weightUnit: 'kg',
  themeMode: 'dark',
  weeklyGoal: 3,
} as const satisfies {
  weightUnit: WeightUnit;
  themeMode: ThemeMode;
  weeklyGoal: number;
};

export const WEEKLY_GOAL_RANGE = {
  min: 1,
  max: 7,
} as const;
