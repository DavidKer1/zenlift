import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

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
  ...props
}: TabTriggerSlotProps & Pick<TabItem, 'iconInactive' | 'iconActive'>) {
  const { colors } = useZenliftTheme();
  const iconTintColor = isFocused ? colors.textPrimary : colors.textSecondary;
  const iconName = isFocused ? iconActive : iconInactive;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        {
          opacity: pressed ? 0.72 : 1,
        },
      ]}>
      <MaterialCommunityIcons name={iconName} size={20} color={iconTintColor} />
      <ThemedText
        type="labelCaps"
        themeColor={isFocused ? 'textPrimary' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  return (
    <View pointerEvents="box-none" style={styles.tabListContainer}>
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
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
    position: 'absolute',
    width: '100%',
  },
  innerContainer: {
    backgroundColor: Platform.select({
      ios: 'rgba(24, 25, 29, 0.80)',
      android: 'rgba(24, 25, 29, 0.95)',
      default: 'rgba(24, 25, 29, 0.80)',
    }),
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 560,
    padding: 6,
    paddingHorizontal: 16,
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
