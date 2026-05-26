import { FlashList, type FlashListProps, type FlashListRef } from '@shopify/flash-list';
import React, { useEffect, useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExercisePicker } from '@/components/routine/ExercisePicker';
import { ThemedText } from '@/components/themed-text';
import { ActiveWorkoutHeaderContent } from '@/components/workout/ActiveWorkoutHeaderContent';
import {
  ACTIVE_WORKOUT_SHARED_TAGS,
  getActiveWorkoutSharedProps,
} from '@/components/workout/activeWorkoutMotion';
import { BottomBar } from '@/components/workout/BottomBar';
import type { WorkoutExerciseWithSets } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ActiveWorkoutExpandedSurfaceProps = {
  elapsed: string;
  exercises: WorkoutExerciseWithSets[];
  finishDisabled: boolean;
  flashListRef: React.RefObject<FlashListRef<WorkoutExerciseWithSets> | null>;
  keyExtractor: (item: WorkoutExerciseWithSets) => string;
  onAddExercise: () => void;
  onClosePicker: () => void;
  onExerciseSelected: (selected: { id: string; name: string }) => void;
  onFinish: () => void;
  onMinimize: () => void;
  onRequestCancel: () => void;
  pickerVisible: boolean;
  renderExercise: NonNullable<FlashListProps<WorkoutExerciseWithSets>['renderItem']>;
  sessionName: string;
};

export function ActiveWorkoutExpandedSurface({
  elapsed,
  exercises,
  finishDisabled,
  flashListRef,
  keyExtractor,
  onAddExercise,
  onClosePicker,
  onExerciseSelected,
  onFinish,
  onMinimize,
  onRequestCancel,
  pickerVisible,
  renderExercise,
  sessionName,
}: ActiveWorkoutExpandedSurfaceProps) {
  const { colors } = useZenliftTheme();
  const appearProgress = useSharedValue(0);

  useEffect(() => {
    appearProgress.value = withTiming(1, {
      duration: 180,
      reduceMotion: ReduceMotion.System,
    });
  }, [appearProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: appearProgress.value,
    transform: [{ translateY: (1 - appearProgress.value) * 16 }],
  }));

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gestureState) => {
        return gestureState.dy > 14 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2;
      },
      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dy > 48 || gestureState.vy > 0.7) {
          onMinimize();
        }
      },
      onStartShouldSetPanResponder: () => false,
    }),
    [onMinimize],
  );

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.surface,
        { backgroundColor: colors.background },
        animatedStyle,
      ]}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View
          style={[
            styles.headerShell,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
          {...panResponder.panHandlers}
          {...getActiveWorkoutSharedProps(ACTIVE_WORKOUT_SHARED_TAGS.headerContainer)}
          testID="active-workout-expanded-header"
        >
          <ActiveWorkoutHeaderContent
            elapsed={elapsed}
            isExpanded
            mutedTextColor={colors.mutedText}
            onChevronPress={onMinimize}
            sessionName={sessionName}
            sessionNameColor="accent"
            textColor={colors.textPrimary}
          />
        </Animated.View>

        <View style={styles.cancelRow}>
          <Pressable
            onPress={onRequestCancel}
            hitSlop={12}
            accessibilityLabel="Cancelar entrenamiento"
            accessibilityRole="button"
          >
            <ThemedText type="small" themeColor="danger">
              Cancel
            </ThemedText>
          </Pressable>
        </View>

        <FlashList<WorkoutExerciseWithSets>
          ref={flashListRef}
          data={exercises}
          keyExtractor={keyExtractor}
          renderItem={renderExercise}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ThemedText type="small" themeColor="mutedText">
                No hay ejercicios aún.
              </ThemedText>
              <ThemedText type="small" themeColor="mutedText">
                Toca &quot;Add Exercise&quot; para empezar.
              </ThemedText>
            </View>
          }
        />

        <BottomBar
          onAddExercise={onAddExercise}
          onFinish={onFinish}
          finishDisabled={finishDisabled}
        />

        <ExercisePicker
          visible={pickerVisible}
          onClose={onClosePicker}
          onSelect={onExerciseSelected}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cancelRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 48,
  },
  headerShell: {
    borderBottomWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listContent: {
    paddingBottom: 8,
    paddingTop: 12,
  },
  safeArea: {
    flex: 1,
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
});
