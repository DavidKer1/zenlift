import { Ionicons } from '@expo/vector-icons';
import type { SymbolViewProps } from 'expo-symbols';

export type AppTabHref = '/' | '/routines' | '/exercise' | '/history' | '/settings';
export type AppTabLabelKey =
  | 'tabs.home'
  | 'tabs.routines'
  | 'tabs.exercises'
  | 'tabs.history'
  | 'tabs.settings';

export type IoniconTabIcon = {
  type: 'ionicon';
  inactive: keyof typeof Ionicons.glyphMap;
  active: keyof typeof Ionicons.glyphMap;
};

export type SymbolTabIcon = {
  type: 'symbol';
  inactive: SymbolViewProps['name'];
  active: SymbolViewProps['name'];
};

export type AppTabItem = {
  href: AppTabHref;
  icon: IoniconTabIcon | SymbolTabIcon;
  labelKey: AppTabLabelKey;
  name: string;
};

export const appTabs: AppTabItem[] = [
  {
    name: 'home',
    href: '/',
    labelKey: 'tabs.home',
    icon: { type: 'ionicon', inactive: 'grid-outline', active: 'grid' },
  },
  {
    name: 'routines',
    href: '/routines',
    labelKey: 'tabs.routines',
    icon: { type: 'ionicon', inactive: 'list-outline', active: 'list' },
  },
  {
    name: 'exercises',
    href: '/exercise',
    labelKey: 'tabs.exercises',
    icon: {
      type: 'symbol',
      inactive: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
      active: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
    },
  },
  {
    name: 'history',
    href: '/history',
    labelKey: 'tabs.history',
    icon: { type: 'ionicon', inactive: 'time-outline', active: 'time' },
  },
  {
    name: 'settings',
    href: '/settings',
    labelKey: 'tabs.settings',
    icon: { type: 'ionicon', inactive: 'settings-outline', active: 'settings' },
  },
];
