import type { ThemeMode } from '@/theme';

export const SETTINGS_MMKV_ID = 'zenlift-settings';

export const SETTINGS_KEYS = {
  weightUnit: 'zenlift.settings.weight_unit',
  themeMode: 'zenlift.settings.theme_mode',
  weeklyGoal: 'zenlift.settings.weekly_goal',
  defaultRest: 'zenlift.settings.default_rest',
  onboardingCompleted: 'zenlift.settings.onboarding_completed',
} as const;

export const LEGACY_THEME_MODE_KEY = 'zenlift.theme.mode';

export type WeightUnit = 'kg' | 'lb';

export const DEFAULT_SETTINGS = {
  weightUnit: 'kg',
  themeMode: 'light',
  weeklyGoal: 3,
  defaultRest: 90,
} as const satisfies {
  weightUnit: WeightUnit;
  themeMode: ThemeMode;
  weeklyGoal: number;
  defaultRest: number;
};

export const WEEKLY_GOAL_RANGE = {
  min: 1,
  max: 7,
} as const;

export const DEFAULT_REST_RANGE = {
  min: 30,
  max: 300,
  step: 15,
} as const;
