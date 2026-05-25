import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MuscleDot } from '@/components/routine/MuscleDot';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { RoutineExerciseWithExercise } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ExerciseRowProps = {
  exercise: RoutineExerciseWithExercise;
  muscleColor: string | null;
  isFirst: boolean;
  isLast: boolean;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
};

export const ExerciseRow = React.memo(function ExerciseRow({
  exercise,
  muscleColor,
  isFirst,
  isLast,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ExerciseRowProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  const handleRemove = useCallback(() => {
    onRemove(exercise.id);
  }, [exercise.id, onRemove]);

  const handleMoveUp = useCallback(() => {
    onMoveUp(exercise.id);
  }, [exercise.id, onMoveUp]);

  const handleMoveDown = useCallback(() => {
    onMoveDown(exercise.id);
  }, [exercise.id, onMoveDown]);

  const hasRepsRange =
    exercise.target_reps_min !== null || exercise.target_reps_max !== null;
  const hasRest = exercise.rest_seconds !== null;

  const repsLabel =
    hasRepsRange
      ? `${exercise.target_reps_min ?? '-'}-${exercise.target_reps_max ?? '-'} reps`
      : null;

  const restLabel = hasRest ? `${exercise.rest_seconds}s rest` : null;

  return (
    <ThemedView
      type="surface"
      style={[
        styles.row,
        {
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.two * 1.5,
        },
      ]}>
      <View style={styles.mainRow}>
        {muscleColor ? <MuscleDot color={muscleColor} size={12} /> : null}
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
            {exercise.exercise.name}
          </ThemedText>
          <View style={styles.targetsRow}>
            {exercise.target_sets !== null ? (
              <ThemedText themeColor="mutedText" style={styles.target}>
                {exercise.target_sets} sets
              </ThemedText>
            ) : null}
            {repsLabel ? (
              <ThemedText themeColor="mutedText" style={styles.target}>
                {repsLabel}
              </ThemedText>
            ) : null}
            {restLabel ? (
              <ThemedText themeColor="mutedText" style={styles.target}>
                {restLabel}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </View>

      <View style={[styles.actionsRow, { borderColor: colors.border }]}>
        <Pressable
          accessibilityLabel={`Eliminar ${exercise.exercise.name}`}
          onPress={handleRemove}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.danger + '14', borderRadius: radius.sm },
            pressed && styles.pressed,
          ]}>
          <SymbolView
            name={'trash' as SymbolViewProps['name']}
            size={14}
            tintColor={colors.danger}
          />
        </Pressable>

        <View style={styles.moveGroup}>
          <Pressable
            accessibilityLabel={`Mover ${exercise.exercise.name} arriba`}
            disabled={isFirst}
            onPress={handleMoveUp}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.sm,
                opacity: isFirst ? 0.3 : pressed ? 0.74 : 1,
              },
            ]}>
            <SymbolView
              name={'chevron.up' as SymbolViewProps['name']}
              size={14}
              tintColor={colors.text}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={`Mover ${exercise.exercise.name} abajo`}
            disabled={isLast}
            onPress={handleMoveDown}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.sm,
                opacity: isLast ? 0.3 : pressed ? 0.74 : 1,
              },
            ]}>
            <SymbolView
              name={'chevron.down' as SymbolViewProps['name']}
              size={14}
              tintColor={colors.text}
            />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  actionsRow: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
    width: 36,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  moveGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.74,
  },
  row: {
    borderWidth: 1,
    gap: 4,
  },
  target: {
    fontSize: 12,
    lineHeight: 16,
  },
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
