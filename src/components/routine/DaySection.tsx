import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExercisePicker, type ExercisePickerSelection } from '@/components/routine/ExercisePicker';
import { ExerciseRow } from '@/components/routine/ExerciseRow';
import { StartWorkoutButton } from '@/components/routine/StartWorkoutButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { FullRoutineDay, RoutineExerciseWithExercise } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';

type DaySectionProps = {
  day: FullRoutineDay;
  routineId: string;
  routineName: string;
  muscleColorMap: Map<string, string | null>;
  onRefresh: () => void;
};

export function DaySection({
  day,
  routineId,
  routineName,
  muscleColorMap,
  onRefresh,
}: DaySectionProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handleRemoveExercise = useCallback(
    async (exerciseId: string) => {
      try {
        const db = await getDatabase();
        const repo = new RoutineRepo(db);
        await repo.deleteExercise(exerciseId);
        onRefresh();
      } catch (error) {
        console.error('[DaySection] Failed to remove exercise:', error);
      }
    },
    [onRefresh],
  );

  const handleMoveExercise = useCallback(
    async (exerciseId: string, direction: 'up' | 'down') => {
      try {
        const ids = day.exercises.map((ex) => ex.id);
        const index = ids.indexOf(exerciseId);
        if (index === -1) return;

        const newIds = [...ids];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newIds.length) return;

        [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];

        const db = await getDatabase();
        const repo = new RoutineRepo(db);
        await repo.reorderExercises(day.id, newIds);
        onRefresh();
      } catch (error) {
        console.error('[DaySection] Failed to reorder exercises:', error);
      }
    },
    [day.id, day.exercises, onRefresh],
  );

  const handleMoveUp = useCallback(
    (exerciseId: string) => {
      handleMoveExercise(exerciseId, 'up');
    },
    [handleMoveExercise],
  );

  const handleMoveDown = useCallback(
    (exerciseId: string) => {
      handleMoveExercise(exerciseId, 'down');
    },
    [handleMoveExercise],
  );

  const handleAddExercise = useCallback(
    async (exercise: ExercisePickerSelection) => {
      setShowPicker(false);
      try {
        const db = await getDatabase();
        const repo = new RoutineRepo(db);
        await repo.createExercise(day.id, { exerciseId: exercise.id });
        onRefresh();
      } catch (error) {
        console.error('[DaySection] Failed to add exercise:', error);
      }
    },
    [day.id, onRefresh],
  );

  const exerciseCount = day.exercises.length;

  return (
    <View style={styles.container}>
      <View style={styles.dayHeader}>
        <ThemedText type="smallBold" themeColor="mutedText" style={styles.dayName}>
          {day.name}
        </ThemedText>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: radius.pill,
            },
          ]}>
          <ThemedText type="smallBold" style={[styles.badgeText, { color: colors.primary }]}>
            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
          </ThemedText>
        </View>
      </View>

      {exerciseCount === 0 ? (
        <ThemedView
          type="surface"
          style={[
            styles.emptyDay,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.three,
            },
          ]}>
          <ThemedText themeColor="mutedText" style={styles.emptyText}>
            No hay ejercicios en este dia
          </ThemedText>
          <Pressable
            accessibilityLabel={`Agregar ejercicio a ${day.name}`}
            onPress={() => setShowPicker(true)}
            style={({ pressed }) => [
              styles.addButton,
              {
                borderColor: colors.primary,
                borderRadius: radius.md,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={{ color: colors.primary }}>
              + Agregar ejercicio
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <View style={styles.exerciseList}>
          {day.exercises.map((exercise: RoutineExerciseWithExercise, index: number) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              isFirst={index === 0}
              isLast={index === exerciseCount - 1}
              muscleColor={muscleColorMap.get(exercise.exercise_id) ?? null}
              onMoveDown={handleMoveDown}
              onMoveUp={handleMoveUp}
              onRemove={handleRemoveExercise}
            />
          ))}
        </View>
      )}

      <View style={styles.dayFooter}>
        {exerciseCount > 0 ? (
          <Pressable
            accessibilityLabel={`Agregar ejercicio a ${day.name}`}
            onPress={() => setShowPicker(true)}
            style={({ pressed }) => [
              styles.addButton,
              {
                borderColor: colors.primary,
                borderRadius: radius.md,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={{ color: colors.primary }}>
              + Agregar ejercicio
            </ThemedText>
          </Pressable>
        ) : null}

        <StartWorkoutButton
          day={day}
          routineId={routineId}
          routineName={routineName}
        />
      </View>

      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
  },
  container: {
    gap: 12,
  },
  dayFooter: {
    gap: 10,
  },
  dayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  dayName: {
    fontSize: 14,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  emptyDay: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exerciseList: {
    gap: 10,
  },
  pressed: {
    opacity: 0.74,
  },
});
