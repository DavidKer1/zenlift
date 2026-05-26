import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActiveWorkoutHeaderContent } from '@/components/workout/ActiveWorkoutHeaderContent';
import {
  ACTIVE_WORKOUT_SHARED_TAGS,
  getActiveWorkoutSharedProps,
} from '@/components/workout/activeWorkoutMotion';
import {
  ACTIVE_WORKOUT_MINIMIZED_HEADER_HEIGHT,
  getBottomTabBarHeight,
} from '@/constants/layout';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ActiveWorkoutMinimizedHeaderProps = {
  elapsed: string;
  onExpand: () => void;
  sessionName: string;
};

export function ActiveWorkoutMinimizedHeader({
  elapsed,
  onExpand,
  sessionName,
}: ActiveWorkoutMinimizedHeaderProps) {
  const { colors } = useZenliftTheme();
  const insets = useSafeAreaInsets();
  const appearProgress = useSharedValue(0);
  const tabBarHeight = getBottomTabBarHeight(insets.bottom);

  useEffect(() => {
    appearProgress.value = withTiming(1, {
      duration: 160,
      reduceMotion: ReduceMotion.System,
    });
  }, [appearProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: appearProgress.value,
    transform: [{ translateY: (1 - appearProgress.value) * 8 }],
  }));

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          bottom: tabBarHeight,
        },
        animatedStyle,
      ]}
      {...getActiveWorkoutSharedProps(ACTIVE_WORKOUT_SHARED_TAGS.headerContainer)}
    >
      <Pressable
        accessibilityLabel="Expandir entrenamiento activo"
        accessibilityRole="button"
        onPress={onExpand}
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.78 : 1 },
        ]}
      >
        <ActiveWorkoutHeaderContent
          elapsed={elapsed}
          isExpanded={false}
          mutedTextColor={colors.mutedText}
          onChevronPress={onExpand}
          sessionName={sessionName}
          textColor={colors.textPrimary}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    height: ACTIVE_WORKOUT_MINIMIZED_HEADER_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  pressable: {
    height: ACTIVE_WORKOUT_MINIMIZED_HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
