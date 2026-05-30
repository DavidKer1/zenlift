import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appTabs, type AppTabItem } from '@/components/app-tabs.config';
import {
  BOTTOM_TAB_BOTTOM_PADDING_MIN,
  BOTTOM_TAB_BUTTON_MIN_HEIGHT,
  BOTTOM_TAB_TOP_PADDING,
} from '@/constants/layout';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          {appTabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={String(t(tab.labelKey))} name={tab.name} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  icon,
  label,
  name,
  isFocused,
  onPressIn,
  onPressOut,
  ...props
}: TabTriggerSlotProps & Pick<AppTabItem, 'icon' | 'name'> & { label: string }) {
  const { colors } = useZenliftTheme();
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressProgress = useSharedValue(0);

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
      testID={`tab-${name}`}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animatedContentStyle]}>
        {icon.type === 'ionicon' ? (
          <Ionicons
            name={isFocused ? icon.active : icon.inactive}
            size={20}
            color={colors.textPrimary}
          />
        ) : (
          <SymbolView
            name={isFocused ? icon.active : icon.inactive}
            size={21}
            tintColor={colors.textPrimary}
          />
        )}
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
          paddingBottom: Math.max(insets.bottom, BOTTOM_TAB_BOTTOM_PADDING_MIN),
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
    paddingTop: BOTTOM_TAB_TOP_PADDING,
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
    minHeight: BOTTOM_TAB_BUTTON_MIN_HEIGHT,
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
