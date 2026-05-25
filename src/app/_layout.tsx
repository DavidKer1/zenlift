import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React, { useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import OnboardingScreen from '@/features/onboarding/OnboardingScreen';
import { SETTINGS_KEYS, SETTINGS_MMKV_ID } from '@/features/settings/constants';
import {
  ThemeProvider as ZenliftThemeProvider,
  useZenliftTheme,
} from '@/providers/ThemeProvider';

const onboardingStorage = createMMKV({ id: SETTINGS_MMKV_ID });

function RootNavigation() {
  const [needsOnboarding, setNeedsOnboarding] = useState(
    () => onboardingStorage.getString(SETTINGS_KEYS.onboardingCompleted) !== 'true',
  );
  const { navigationTheme } = useZenliftTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <AnimatedSplashOverlay />
      {needsOnboarding ? (
        <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />
      ) : (
        <AppTabs />
      )}
    </NavigationThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ZenliftThemeProvider>
      <RootNavigation />
    </ZenliftThemeProvider>
  );
}
