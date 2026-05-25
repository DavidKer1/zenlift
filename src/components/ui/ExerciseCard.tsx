import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Equipment, SQLiteBoolean } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { muscleColors, type MuscleGroupName } from '@/theme/muscleColors';

type ExerciseCardExercise = {
  id: string;
  name: string;
  equipment: Equipment;
  is_favorite: SQLiteBoolean;
  primaryMuscleName: string | null;
  primaryMuscleLabel: string | null;
  primaryMuscleColor: string | null;
};

type ExerciseCardProps = {
  exercise: ExerciseCardExercise;
  onPress: (exerciseId: string) => void;
  onFavoriteToggle: (exerciseId: string) => void;
};

const equipmentLabels: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Maquina',
  cable: 'Cable',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  smith_machine: 'Smith',
  ez_bar: 'Barra EZ',
  cardio_machine: 'Cardio',
  other: 'Otro',
};

function getEquipmentIcon(equipment: Equipment): SymbolViewProps['name'] {
  switch (equipment) {
    case 'bodyweight':
      return { ios: 'figure.strengthtraining.traditional', android: 'accessibility_new', web: 'accessibility_new' };
    case 'cardio_machine':
      return { ios: 'figure.run', android: 'directions_run', web: 'directions_run' };
    default:
      return { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' };
  }
}

function getMuscleColor(name: string | null, fallback: string | null, defaultColor: string) {
  if (name && name in muscleColors) {
    return muscleColors[name as MuscleGroupName];
  }

  return fallback ?? defaultColor;
}

function ExerciseCardComponent({ exercise, onPress, onFavoriteToggle }: ExerciseCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const isFavorite = exercise.is_favorite === 1;
  const muscleColor = getMuscleColor(exercise.primaryMuscleName, exercise.primaryMuscleColor, colors.mutedText);
  const muscleLabel = exercise.primaryMuscleLabel ?? 'Sin musculo';

  return (
    <Pressable
      accessibilityLabel={`Abrir ${exercise.name}`}
      accessibilityRole="button"
      onPress={() => onPress(exercise.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.three,
        },
        pressed && styles.pressed,
      ]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.iconWell,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            borderRadius: radius.md,
          },
        ]}>
        <SymbolView name={getEquipmentIcon(exercise.equipment)} size={24} tintColor={colors.text} />
      </View>

      <View style={styles.content}>
        <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
          {exercise.name}
        </ThemedText>

        <View style={styles.metaRow}>
          <View style={[styles.muscleDot, { backgroundColor: muscleColor }]} />
          <ThemedText themeColor="mutedText" type="small" numberOfLines={1} style={styles.metaText}>
            {muscleLabel}
          </ThemedText>
          <ThemedText themeColor="mutedText" type="small" style={styles.metaDivider}>
            /
          </ThemedText>
          <SymbolView name={getEquipmentIcon(exercise.equipment)} size={13} tintColor={colors.mutedText} />
          <ThemedText themeColor="mutedText" type="small" numberOfLines={1} style={styles.metaText}>
            {equipmentLabels[exercise.equipment]}
          </ThemedText>
        </View>
      </View>

      <Pressable
        accessibilityLabel={isFavorite ? 'Quitar favorito' : 'Marcar favorito'}
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onFavoriteToggle(exercise.id);
        }}
        style={({ pressed }) => [
          styles.favoriteButton,
          {
            backgroundColor: isFavorite ? colors.primarySoft : colors.surfaceElevated,
            borderColor: isFavorite ? colors.primary : colors.border,
            borderRadius: radius.pill,
          },
          pressed && styles.favoritePressed,
        ]}>
        <SymbolView
          name={
            isFavorite
              ? { ios: 'star.fill', android: 'star', web: 'star' }
              : { ios: 'star', android: 'star_border', web: 'star_border' }
          }
          size={18}
          tintColor={isFavorite ? colors.primary : colors.mutedText}
        />
      </Pressable>
    </Pressable>
  );
}

export const ExerciseCard = memo(ExerciseCardComponent);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
  },
  content: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  favoriteButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  favoritePressed: {
    opacity: 0.78,
  },
  iconWell: {
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  metaDivider: {
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  muscleDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  name: {
    fontSize: 16,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
  },
});
