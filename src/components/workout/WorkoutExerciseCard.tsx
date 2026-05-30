import React, { memo, useCallback, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { MuscleDot } from '@/components/routine/MuscleDot';
import { SetRow } from '@/components/workout/SetRow';
import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { WorkoutExerciseWithSets } from '@/domain/entities';
import { muscleColors, type MuscleGroupName } from '@/theme/muscleColors';

const ORANGE = '#F97316';

type PreviousPerformance = {
  weight: number;
  reps: number;
} | null;

export type WorkoutExerciseCardProps = {
  exercise: WorkoutExerciseWithSets;
  onAddSet: (workoutExerciseId: string) => void;
  onCompleteSet: (exerciseId: string, setId: string) => void;
  onWeightChange: (setId: string, weight: number) => void;
  onRepsChange: (setId: string, reps: number) => void;
  unit: string;
  previousPerformance: PreviousPerformance;
  primaryMuscleName?: string | null;
  primaryMuscleColor?: string | null;
};

function formatTarget(targetSets: number | null | undefined, targetRepsMin: number | null | undefined, targetRepsMax: number | null | undefined): string | null {
  if (!targetSets) return null;
  let text = `${targetSets} sets`;
  if (targetRepsMin) {
    text += targetRepsMax && targetRepsMax !== targetRepsMin
      ? ` x ${targetRepsMin}-${targetRepsMax}`
      : ` x ${targetRepsMin}`;
  }
  return text;
}

function getMuscleDotColor(name: string | null | undefined, fallback: string | null | undefined, defaultColor: string): string {
  if (name && name in muscleColors) {
    return muscleColors[name as MuscleGroupName];
  }
  return fallback ?? defaultColor;
}

function getSetRenderSignature(exercise: WorkoutExerciseWithSets): string {
  return exercise.sets
    .map((set) =>
      [
        set.id,
        set.set_number,
        set.weight,
        set.reps,
        set.set_type,
        set.is_completed,
        set.completed_at ?? '',
        set.notes ?? '',
      ].join(':'),
    )
    .join('|');
}

export function isWorkoutExerciseComplete(exercise: WorkoutExerciseWithSets): boolean {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.is_completed === 1);
}

export function areWorkoutExerciseCardPropsEqual(
  prev: WorkoutExerciseCardProps,
  next: WorkoutExerciseCardProps,
): boolean {
  return (
    prev.exercise.id === next.exercise.id &&
    prev.exercise.exercise?.id === next.exercise.exercise?.id &&
    prev.exercise.exercise?.name === next.exercise.exercise?.name &&
    getSetRenderSignature(prev.exercise) === getSetRenderSignature(next.exercise) &&
    prev.unit === next.unit &&
    prev.previousPerformance?.weight === next.previousPerformance?.weight &&
    prev.previousPerformance?.reps === next.previousPerformance?.reps &&
    prev.primaryMuscleName === next.primaryMuscleName &&
    prev.primaryMuscleColor === next.primaryMuscleColor
  );
}

function WorkoutExerciseCardComponent({
  exercise,
  onAddSet,
  onCompleteSet,
  onWeightChange,
  onRepsChange,
  unit,
  previousPerformance,
  primaryMuscleName,
  primaryMuscleColor,
}: WorkoutExerciseCardProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
  const completionColor = (colors as { success?: string }).success ?? ORANGE;

  const sortedSets = useMemo(
    () => [...exercise.sets].sort((a, b) => a.set_number - b.set_number),
    [exercise.sets],
  );

  const completedCount = useMemo(
    () => sortedSets.filter((s) => s.is_completed === 1).length,
    [sortedSets],
  );

  const totalSets = sortedSets.length;

  const muscleDotColor = getMuscleDotColor(
    primaryMuscleName,
    primaryMuscleColor,
    colors.mutedText,
  );

  const targetText = formatTarget(undefined, undefined, undefined);

  const prevPerfText = previousPerformance
    ? `${previousPerformance.weight} ${unit} x ${previousPerformance.reps}`
    : null;

  const isExerciseComplete = isWorkoutExerciseComplete(exercise);
  const completedContentStyle = isExerciseComplete ? styles.completedContent : null;

  const handleAddSet = useCallback(() => {
    onAddSet(exercise.id);
  }, [exercise.id, onAddSet]);

  const handleCompleteSet = useCallback(
    (_setId: string) => {
      onCompleteSet(exercise.id, _setId);
    },
    [exercise.id, onCompleteSet],
  );

  const handleWeightChange = useCallback(
    (setId: string, weight: number) => {
      onWeightChange(setId, weight);
    },
    [onWeightChange],
  );

  const handleRepsChange = useCallback(
    (setId: string, reps: number) => {
      onRepsChange(setId, reps);
    },
    [onRepsChange],
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xl,
          marginHorizontal: spacing.three,
        },
      ]}
    >
      <View
        accessibilityLabel={String(
          t('workout.active.a11y.exerciseProgress', {
            completed: completedCount,
            name: exercise.exercise?.name ?? t('workout.active.fallbackExercise'),
            total: totalSets,
          }),
        )}
        testID={`active-workout-exercise-${exercise.id}-header`}
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            padding: spacing.three,
          },
        ]}
      >
        <View style={[styles.headerContent, completedContentStyle]}>
          <View style={styles.headerInfo}>
            <ThemedText
              type="smallBold"
              style={{ fontSize: 18, lineHeight: 24 }}
            >
              {exercise.exercise?.name ?? t('workout.active.fallbackExercise')}
            </ThemedText>

            <View style={styles.headerMeta}>
              {primaryMuscleName || primaryMuscleColor ? (
                <MuscleDot color={muscleDotColor} size={10} />
              ) : null}

              {prevPerfText ? (
                <ThemedText
                  type="small"
                  themeColor="mutedText"
                  style={{ fontSize: 13 }}
                >
                  {prevPerfText}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.headerRight}>
            <ThemedText
              type="small"
              themeColor="mutedText"
              style={{ fontSize: 13 }}
            >
              {completedCount}/{totalSets}
            </ThemedText>

            {isExerciseComplete ? (
              <ThemedText
                style={[
                  styles.completedBadge,
                  { color: completionColor },
                ]}
              >
                {String(t('workout.active.completed', { defaultValue: 'Completado' }))}
              </ThemedText>
            ) : null}
          </View>
        </View>

        {targetText ? (
          <ThemedText
            type="small"
            themeColor="mutedText"
            style={{ fontSize: 12, marginTop: 4 }}
          >
            {targetText}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.expandedContent}>
        <View
          style={[
            styles.setHeaderRow,
            completedContentStyle,
            {
              borderBottomColor: colors.border,
              paddingHorizontal: spacing.one,
              paddingVertical: spacing.two,
            },
          ]}
        >
          <View style={styles.setNumberCol}>
            <ThemedText
              type="small"
              themeColor="mutedText"
              style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}
            >
              {t('workout.active.headers.set')}
            </ThemedText>
          </View>
          <View style={styles.prevCol}>
            <ThemedText
              type="small"
              themeColor="mutedText"
              style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}
            >
              {t('workout.active.headers.previous')}
            </ThemedText>
          </View>
          <View style={styles.inputGroup}>
            <ThemedText
              type="small"
              themeColor="mutedText"
              style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', flex: 1 }}
            >
              {t('workout.active.headers.weight')}
            </ThemedText>
          </View>
          <View style={styles.inputGroup}>
            <ThemedText
              type="small"
              themeColor="mutedText"
              style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', flex: 1 }}
            >
              {t('workout.active.headers.reps')}
            </ThemedText>
          </View>
          <View style={styles.checkCol} />
        </View>

        {sortedSets.map((set) => {
          const prevIdx = sortedSets.indexOf(set) - 1;
          const prevSet = prevIdx >= 0 ? sortedSets[prevIdx] : null;

          return (
            <View key={set.id} style={completedContentStyle}>
              <SetRow
                setId={set.id}
                setNumber={set.set_number}
                previousWeight={prevSet?.is_completed ? prevSet.weight : previousPerformance?.weight}
                previousReps={prevSet?.is_completed ? prevSet.reps : previousPerformance?.reps}
                weight={set.weight}
                reps={set.reps}
                setType={set.set_type}
                isCompleted={set.is_completed === 1}
                unit={unit}
                onComplete={handleCompleteSet}
                onWeightChange={handleWeightChange}
                onRepsChange={handleRepsChange}
              />
            </View>
          );
        })}

        <Pressable
          accessibilityLabel={String(t('workout.active.addSet'))}
          accessibilityRole="button"
          testID={`active-workout-exercise-${exercise.id}-add-set`}
          onPress={handleAddSet}
          style={({ pressed }) => [
            styles.addSetButton,
            {
              borderColor: ORANGE,
              borderRadius: radius.md,
              margin: spacing.one,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText
            style={{ color: ORANGE, fontSize: 14, fontWeight: '700' }}
          >
            {t('workout.active.addSet')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

export const WorkoutExerciseCard = memo(
  WorkoutExerciseCardComponent,
  areWorkoutExerciseCardPropsEqual,
);

const styles = StyleSheet.create({
  addSetButton: {
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    height: 44,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  checkCol: {
    width: 40,
  },
  completedBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedContent: {
    opacity: 0.58,
  },
  expandedContent: {},
  header: {
    borderBottomWidth: 1,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  headerMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
    maxWidth: 130,
  },
  prevCol: {
    width: 68,
  },
  setHeaderRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 4,
  },
  setNumberCol: {
    width: 28,
  },
});
