import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import {
  ACTIVE_WORKOUT_SHARED_TAGS,
  getActiveWorkoutSharedProps,
} from '@/components/workout/activeWorkoutMotion';
import type { ThemeColor } from '@/theme';

const ORANGE = '#F97316';

type ActiveWorkoutHeaderContentProps = {
  elapsed: string;
  isExpanded: boolean;
  mutedTextColor: string;
  onChevronPress: () => void;
  sessionName: string;
  sessionNameColor?: ThemeColor;
  textColor: string;
};

export function ActiveWorkoutHeaderContent({
  elapsed,
  isExpanded,
  mutedTextColor,
  onChevronPress,
  sessionName,
  sessionNameColor,
  textColor,
}: ActiveWorkoutHeaderContentProps) {
  return (
    <View style={styles.row}>
      <Animated.View
        style={styles.left}
        {...getActiveWorkoutSharedProps(ACTIVE_WORKOUT_SHARED_TAGS.title)}
      >
        <ThemedText
          type="smallBold"
          themeColor={sessionNameColor}
          numberOfLines={1}
          style={styles.sessionLabel}
        >
          {sessionName.toUpperCase()}
        </ThemedText>
      </Animated.View>

      <Animated.View
        style={styles.center}
        {...getActiveWorkoutSharedProps(ACTIVE_WORKOUT_SHARED_TAGS.timer)}
      >
        <View style={styles.dot} />
        <ThemedText style={[styles.timer, { color: textColor }]}>{elapsed}</ThemedText>
      </Animated.View>

      <Pressable
        onPress={onChevronPress}
        hitSlop={12}
        accessibilityLabel={isExpanded ? 'Minimizar entrenamiento' : 'Expandir entrenamiento'}
        accessibilityRole="button"
        style={styles.chevron}
      >
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-up'}
          size={22}
          color={mutedTextColor}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 12,
  },
  chevron: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: ORANGE,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  sessionLabel: {
    flexShrink: 1,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
  },
});
