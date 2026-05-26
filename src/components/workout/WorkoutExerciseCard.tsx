import React, { memo, useCallback, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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

type WorkoutExerciseCardProps = {
  exercise: WorkoutExerciseWithSets;
  isExpanded: boolean;
  onToggle: (exerciseId: string) => void;
  onAddSet: (workoutExerciseId: string) => void;
  onCompleteSet: (exerciseId: string, setId: string) => void;
  onWeightChange: (setId: string, weight: number) => void;
  onRepsChange: (setId: string, reps: number) => void;
  unit: string;
  increment: number;
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

function WorkoutExerciseCardComponent({
  exercise,
  isExpanded,
  onToggle,
  onAddSet,
  onCompleteSet,
  onWeightChange,
  onRepsChange,
  unit,
  increment,
  previousPerformance,
  primaryMuscleName,
  primaryMuscleColor,
}: WorkoutExerciseCardProps) {
  const { colors, radius, spacing } = useZenliftTheme();

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

  const handleHeaderPress = useCallback(() => {
    onToggle(exercise.id);
  }, [exercise.id, onToggle]);

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
      <Pressable
        accessibilityLabel={`${exercise.exercise?.name ?? 'Ejercicio'}, ${completedCount}/${totalSets} sets completados`}
        accessibilityRole="button"
        testID={`active-workout-exercise-${exercise.id}-header`}
        onPress={handleHeaderPress}
        style={({ pressed }) => [
          styles.header,
          {
            borderBottomColor: isExpanded ? colors.border : 'transparent',
            opacity: pressed ? 0.72 : 1,
            padding: spacing.three,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <ThemedText
              type="smallBold"
              style={{ fontSize: 18, lineHeight: 24 }}
            >
              {exercise.exercise?.name ?? 'Ejercicio'}
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

            <ThemedText
              style={{
                fontSize: 14,
                color: colors.mutedText,
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            >
              ▼
            </ThemedText>
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
      </Pressable>

      {isExpanded ? (
        <View style={styles.expandedContent}>
          <View
            style={[
              styles.setHeaderRow,
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
                Set
              </ThemedText>
            </View>
            <View style={styles.prevCol}>
              <ThemedText
                type="small"
                themeColor="mutedText"
                style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}
              >
                Prev.
              </ThemedText>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText
                type="small"
                themeColor="mutedText"
                style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', flex: 1 }}
              >
                Weight
              </ThemedText>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText
                type="small"
                themeColor="mutedText"
                style={{ fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', flex: 1 }}
              >
                Reps
              </ThemedText>
            </View>
            <View style={styles.checkCol} />
          </View>

          {sortedSets.map((set) => {
            const prevIdx = sortedSets.indexOf(set) - 1;
            const prevSet = prevIdx >= 0 ? sortedSets[prevIdx] : null;

            return (
              <SetRow
                key={set.id}
                setId={set.id}
                setNumber={set.set_number}
                previousWeight={prevSet?.is_completed ? prevSet.weight : previousPerformance?.weight}
                previousReps={prevSet?.is_completed ? prevSet.reps : previousPerformance?.reps}
                weight={set.weight}
                reps={set.reps}
                setType={set.set_type}
                isCompleted={set.is_completed === 1}
                unit={unit}
                increment={increment}
                onComplete={handleCompleteSet}
                onWeightChange={handleWeightChange}
                onRepsChange={handleRepsChange}
              />
            );
          })}

          <Pressable
            accessibilityLabel="Agregar set"
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
              + Add Set
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export const WorkoutExerciseCard = memo(
  WorkoutExerciseCardComponent,
  (prev, next) =>
    prev.exercise.id === next.exercise.id &&
    prev.exercise.sets.length === next.exercise.sets.length &&
    prev.isExpanded === next.isExpanded &&
    prev.previousPerformance?.weight === next.previousPerformance?.weight &&
    prev.previousPerformance?.reps === next.previousPerformance?.reps,
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
