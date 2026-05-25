import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type TabItem = {
  href: '/' | '/routines' | '/history' | '/settings';
  iconInactive: keyof typeof MaterialCommunityIcons.glyphMap;
  iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  name: string;
};

const tabs: TabItem[] = [
  {
    name: 'home',
    href: '/',
    label: 'Home',
    iconInactive: 'home-outline',
    iconActive: 'home',
  },
  {
    name: 'routines',
    href: '/routines',
    label: 'Rutinas',
    iconInactive: 'dumbbell',
    iconActive: 'dumbbell',
  },
  {
    name: 'history',
    href: '/history',
    label: 'Historial',
    iconInactive: 'chart-bar',
    iconActive: 'chart-bar',
  },
  {
    name: 'settings',
    href: '/settings',
    label: 'Settings',
    iconInactive: 'cog-outline',
    iconActive: 'cog',
  },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton iconInactive={tab.iconInactive} iconActive={tab.iconActive}>
                {tab.label}
              </TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  children,
  iconInactive,
  iconActive,
  isFocused,
  onPressIn,
  onPressOut,
  ...props
}: TabTriggerSlotProps & Pick<TabItem, 'iconInactive' | 'iconActive'>) {
  const { colors } = useZenliftTheme();
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressProgress = useSharedValue(0);
  const iconName = isFocused ? iconActive : iconInactive;

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: 180,
      reduceMotion: ReduceMotion.System,
    });
  }, [focusProgress, isFocused]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + focusProgress.value * 0.5 - pressProgress.value * 0.08,
    transform: [
      { translateY: -2 * focusProgress.value + pressProgress.value },
      { scale: 1 + focusProgress.value * 0.08 - pressProgress.value * 0.03 },
    ],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    pressProgress.value = withTiming(1, {
      duration: 80,
      reduceMotion: ReduceMotion.System,
    });
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    pressProgress.value = withTiming(0, {
      duration: 120,
      reduceMotion: ReduceMotion.System,
    });
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animatedContentStyle]}>
        <MaterialCommunityIcons name={iconName} size={21} color={colors.textPrimary} />
        <ThemedText type="labelCaps" themeColor="textPrimary" style={styles.tabLabel}>
          {children}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const { colors } = useZenliftTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabListContainer,
        {
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
      <View style={styles.innerContainer} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabListContainer: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingTop: 6,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: 6,
  },
  tabContent: {
    alignItems: 'center',
    gap: 3,
    justifyContent: 'center',
    minHeight: 44,
  },
  tabLabel: {
    lineHeight: 12,
  },
});
