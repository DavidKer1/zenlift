import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createMMKV } from 'react-native-mmkv';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import ActiveWorkoutModal from '@/components/workout/ActiveWorkoutModal';
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
      <GestureHandlerRootView style={styles.root}>
        <AnimatedSplashOverlay />
        {needsOnboarding ? (
          <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />
        ) : (
          <>
            <AppTabs />
            <ActiveWorkoutModal />
          </>
        )}
      </GestureHandlerRootView>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
