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
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  const { colors, spacing } = useZenliftTheme();
  const color = isFocused ? colors.primary : colors.mutedText;
  const iconName = isFocused ? iconActive : iconInactive;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        {
          backgroundColor: isFocused ? colors.primarySoft : 'transparent',
          paddingHorizontal: spacing.two,
          paddingVertical: spacing.two,
          opacity: pressed ? 0.72 : 1,
        },
      ]}>
      <MaterialCommunityIcons name={iconName} size={20} color={color} />
      <ThemedText type="bodyStrong" style={[styles.tabLabel, { color }]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const { colors, spacing } = useZenliftTheme();

  return (
    <View pointerEvents="box-none" style={[styles.tabListContainer, { padding: spacing.three }]}>
      <ThemedView
        type="surface"
        style={[
          styles.innerContainer,
          {
            borderColor: colors.border,
            shadowColor: colors.text,
          },
        ]}
        {...props}
      />
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
    position: 'absolute',
    width: '100%',
  },
  innerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    elevation: 6,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    maxWidth: 560,
    padding: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 56,
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
