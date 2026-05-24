import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import {
  ThemeProvider as ZenliftThemeProvider,
  useZenliftTheme,
} from '@/providers/ThemeProvider';

function RootNavigation() {
  const { navigationTheme } = useZenliftTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
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
