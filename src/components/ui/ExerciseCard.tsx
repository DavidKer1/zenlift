import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { i18n, t } = useTranslation();
  const isFavorite = exercise.is_favorite === 1;
  const muscleColor = getMuscleColor(exercise.primaryMuscleName, exercise.primaryMuscleColor, colors.mutedText);
  const muscleLabel =
    exercise.primaryMuscleName && i18n.language !== 'es'
      ? exercise.primaryMuscleName
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      : exercise.primaryMuscleLabel ?? String(t('exercises.noMuscle'));

  return (
    <Pressable
      accessibilityLabel={String(t('exercises.a11y.openExercise', { name: exercise.name }))}
      accessibilityRole="button"
      onPress={() => onPress(exercise.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.three,
          transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
        },
      ]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.iconWell,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.sm,
          },
        ]}>
        <SymbolView name={getEquipmentIcon(exercise.equipment)} size={24} tintColor={colors.textBody} />
      </View>

      <View style={styles.content}>
        <ThemedText type="bodyMd" numberOfLines={2} style={styles.name}>
          {exercise.name}
        </ThemedText>

        <View style={styles.metaRow}>
          <View style={[styles.muscleDot, { backgroundColor: muscleColor }]} />
          <ThemedText themeColor="textSecondary" type="bodyMd" numberOfLines={1} style={styles.metaText}>
            {muscleLabel}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="bodyMd" style={styles.metaDivider}>
            /
          </ThemedText>
          <SymbolView name={getEquipmentIcon(exercise.equipment)} size={13} tintColor={colors.textSecondary} />
          <ThemedText themeColor="textSecondary" type="bodyMd" numberOfLines={1} style={styles.metaText}>
            {t(`exercises.equipmentOptions.${exercise.equipment}`)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        accessibilityLabel={String(
          t(isFavorite ? 'exercises.a11y.removeFavorite' : 'exercises.a11y.markFavorite'),
        )}
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
            backgroundColor: isFavorite ? colors.surfaceElevated : colors.surfaceSecondary,
            borderRadius: radius.pill,
            opacity: pressed ? 0.78 : 1,
          },
        ]}>
        <SymbolView
          name={
            isFavorite
              ? { ios: 'star.fill', android: 'star', web: 'star' }
              : { ios: 'star', android: 'star_border', web: 'star_border' }
          }
          size={18}
          tintColor={isFavorite ? colors.textPrimary : colors.textSecondary}
        />
      </Pressable>
    </Pressable>
  );
}

export const ExerciseCard = memo(ExerciseCardComponent);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
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
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconWell: {
    alignItems: 'center',
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
