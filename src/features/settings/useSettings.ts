import { useCallback, useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

import {
  DEFAULT_SETTINGS,
  LEGACY_THEME_MODE_KEY,
  SETTINGS_KEYS,
  SETTINGS_MMKV_ID,
  WEEKLY_GOAL_RANGE,
  type WeightUnit,
} from '@/features/settings/constants';
import type { ThemeMode } from '@/theme';

export const settingsStorage = createMMKV({
  id: SETTINGS_MMKV_ID,
});

type SettingsSnapshot = {
  weightUnit: WeightUnit;
  themeMode: ThemeMode;
  weeklyGoal: number;
};

type SettingsValue = WeightUnit | ThemeMode | number;

const SETTINGS_KEY_SET = new Set<string>([
  SETTINGS_KEYS.weightUnit,
  SETTINGS_KEYS.themeMode,
  SETTINGS_KEYS.weeklyGoal,
  LEGACY_THEME_MODE_KEY,
]);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isWeightUnit(value: string | undefined): value is WeightUnit {
  return value === 'kg' || value === 'lb';
}

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readInteger(key: string, fallback: number, min: number, max: number): number {
  const value = settingsStorage.getString(key);
  const parsed = Number.parseInt(value ?? '', 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, min, max);
}

function readSettingsSnapshot(): SettingsSnapshot {
  const storedWeightUnit = settingsStorage.getString(SETTINGS_KEYS.weightUnit);
  const storedThemeMode =
    settingsStorage.getString(SETTINGS_KEYS.themeMode) ??
    settingsStorage.getString(LEGACY_THEME_MODE_KEY);

  return {
    weightUnit: isWeightUnit(storedWeightUnit) ? storedWeightUnit : DEFAULT_SETTINGS.weightUnit,
    themeMode: isThemeMode(storedThemeMode) ? storedThemeMode : DEFAULT_SETTINGS.themeMode,
    weeklyGoal: readInteger(
      SETTINGS_KEYS.weeklyGoal,
      DEFAULT_SETTINGS.weeklyGoal,
      WEEKLY_GOAL_RANGE.min,
      WEEKLY_GOAL_RANGE.max,
    ),
  };
}

function persistNumber(key: string, value: number): void {
  settingsStorage.set(key, String(value));
}

export function clearSettingsStorage(): void {
  settingsStorage.clearAll();
}

export function getSettingsValue(key: keyof SettingsSnapshot): SettingsValue {
  return readSettingsSnapshot()[key];
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsSnapshot>(readSettingsSnapshot);

  const refreshSettings = useCallback(() => {
    setSettings(readSettingsSnapshot());
  }, []);

  useEffect(() => {
    const listener = settingsStorage.addOnValueChangedListener((changedKey) => {
      if (SETTINGS_KEY_SET.has(changedKey)) {
        refreshSettings();
      }
    });

    return () => listener.remove();
  }, [refreshSettings]);

  const setWeightUnit = useCallback((weightUnit: WeightUnit) => {
    settingsStorage.set(SETTINGS_KEYS.weightUnit, weightUnit);
    setSettings(readSettingsSnapshot());
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    settingsStorage.set(SETTINGS_KEYS.themeMode, themeMode);
    settingsStorage.set(LEGACY_THEME_MODE_KEY, themeMode);
    setSettings(readSettingsSnapshot());
  }, []);

  const setWeeklyGoal = useCallback((weeklyGoal: number) => {
    const nextGoal = clamp(Math.round(weeklyGoal), WEEKLY_GOAL_RANGE.min, WEEKLY_GOAL_RANGE.max);
    persistNumber(SETTINGS_KEYS.weeklyGoal, nextGoal);
    setSettings(readSettingsSnapshot());
  }, []);

  return {
    ...settings,
    setWeightUnit,
    setThemeMode,
    setWeeklyGoal,
  };
}
