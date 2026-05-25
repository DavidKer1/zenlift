import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type TabItem = {
  href: '/' | '/routines' | '/history' | '/settings';
  iconInactive: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
  name: string;
};

const tabs: TabItem[] = [
  {
    name: 'home',
    href: '/',
    label: 'Home',
    iconInactive: 'grid-outline',
    iconActive: 'grid',
  },
  {
    name: 'routines',
    href: '/routines',
    label: 'Routines',
    iconInactive: 'barbell-outline',
    iconActive: 'barbell',
  },
  {
    name: 'history',
    href: '/history',
    label: 'History',
    iconInactive: 'time-outline',
    iconActive: 'time',
  },
  {
    name: 'settings',
    href: '/settings',
    label: 'Settings',
    iconInactive: 'settings-outline',
    iconActive: 'settings',
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
              <TabButton
                iconInactive={tab.iconInactive}
                iconActive={tab.iconActive}
                label={tab.label}
              />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  iconInactive,
  iconActive,
  label,
  isFocused,
  onPressIn,
  onPressOut,
  ...props
}: TabTriggerSlotProps & Pick<TabItem, 'iconInactive' | 'iconActive' | 'label'>) {
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
    opacity: 0.4 + focusProgress.value * 0.6 - pressProgress.value * 0.08,
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
      accessibilityLabel={label}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animatedContentStyle]}>
        <Ionicons name={iconName} size={20} color={colors.textPrimary} />
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
    minHeight: 52,
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
