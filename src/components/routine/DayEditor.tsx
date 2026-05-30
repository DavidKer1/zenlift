import React, { useState } from 'react';
import { Controller, useFieldArray, useFormState, useWatch, type Control } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  ExerciseConfigurator,
  type ExerciseConfiguration,
} from '@/components/routine/ExerciseConfigurator';
import {
  ExercisePicker,
  type ExercisePickerSelection,
} from '@/components/routine/ExercisePicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  createExerciseFormValues,
} from '@/features/routine/routineFormMapping';
import type { ExerciseFormValues, RoutineFormValues } from '@/features/routine/routineFormSchema';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type DayEditorProps = {
  control: Control<RoutineFormValues>;
  dayIndex: number;
  dayCount: number;
  onRemoveDay: () => void;
  onMoveDayUp: () => void;
  onMoveDayDown: () => void;
};

type ConfiguratorState =
  | { mode: 'add'; exercise: ExercisePickerSelection }
  | { mode: 'edit'; exerciseIndex: number; exercise: ExerciseFormValues }
  | null;

export function DayEditor({
  control,
  dayIndex,
  dayCount,
  onRemoveDay,
  onMoveDayDown,
  onMoveDayUp,
}: DayEditorProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [configurator, setConfigurator] = useState<ConfiguratorState>(null);
  const { errors } = useFormState({ control });
  const dayError = errors.days?.[dayIndex];
  const watchedExercises = useWatch({
    control,
    name: `days.${dayIndex}.exercises`,
  }) ?? [];

  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
    move: moveExercise,
    update: updateExercise,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.exercises`,
    keyName: 'fieldKey',
  });

  function handleConfigConfirm(configuration: ExerciseConfiguration) {
    if (!configurator) return;

    if (configurator.mode === 'add') {
      appendExercise(
        createExerciseFormValues({
          exerciseId: configurator.exercise.id,
          exerciseName: configurator.exercise.name,
          ...configuration,
        }),
      );
    } else {
      updateExercise(configurator.exerciseIndex, {
        ...configurator.exercise,
        ...configuration,
      });
    }

    setConfigurator(null);
  }

  return (
    <ThemedView
      type="surface"
      style={[
        styles.card,
        {
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.three,
        },
      ]}>
      <View style={styles.cardHeader}>
        <Pressable
          accessibilityLabel={String(t(isExpanded ? 'routines.day.collapse' : 'routines.day.expand'))}
          onPress={() => setIsExpanded((current) => !current)}
          style={({ pressed }) => [
            styles.expandButton,
            { backgroundColor: colors.surfaceElevated, borderRadius: radius.md },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold">{isExpanded ? 'v' : '>'}</ThemedText>
        </Pressable>

        <View style={styles.dayTitleWrap}>
          <Controller
            control={control}
            name={`days.${dayIndex}.name`}
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                accessibilityLabel={String(t('routines.day.nameA11y', { number: dayIndex + 1 }))}
                testID={`routine-day-${dayIndex + 1}-name-input`}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={String(t('routines.day.namePlaceholder'))}
                placeholderTextColor={colors.mutedText}
                style={[
                  styles.dayNameInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    fontSize: typography.size.lg,
                  },
                ]}
                value={value}
              />
            )}
          />
          {dayError?.name?.message ? (
            <ThemedText type="small" style={{ color: colors.danger }}>
              ! {translateRoutineMessage(String(dayError.name.message), t)}
            </ThemedText>
          ) : null}
        </View>

        <ThemedView
          type="primarySoft"
          style={[styles.badge, { borderRadius: radius.pill }]}>
          <ThemedText type="smallBold" style={{ color: colors.primary }}>
            {watchedExercises.length}
          </ThemedText>
        </ThemedView>
      </View>

      <View style={styles.dayActions}>
        <SmallActionButton
          accessibilityLabel={String(t('routines.day.moveUp'))}
          disabled={dayIndex === 0}
          label={String(t('routines.day.moveUpShort'))}
          onPress={onMoveDayUp}
        />
        <SmallActionButton
          accessibilityLabel={String(t('routines.day.moveDown'))}
          disabled={dayIndex === dayCount - 1}
          label={String(t('routines.day.moveDownShort'))}
          onPress={onMoveDayDown}
        />
        <SmallActionButton
          accessibilityLabel={String(t('routines.day.remove'))}
          disabled={dayCount <= 1}
          label={String(t('routines.day.removeShort'))}
          onPress={onRemoveDay}
          danger
        />
      </View>

      {isExpanded ? (
        <View style={styles.expandedContent}>
          {dayError?.exercises?.message ? (
            <ThemedView
              type="primarySoft"
              style={[styles.inlineError, { borderColor: colors.primary, borderRadius: radius.md }]}>
              <ThemedText type="smallBold" style={{ color: colors.danger }}>
                ! {translateRoutineMessage(String(dayError.exercises.message), t)}
              </ThemedText>
            </ThemedView>
          ) : null}

          {exerciseFields.map((field, exerciseIndex) => {
            const exercise = watchedExercises[exerciseIndex] ?? field;

            return (
              <ThemedView
                key={field.fieldKey}
                type="backgroundElement"
                style={[styles.exerciseCard, { borderRadius: radius.md }]}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseCopy}>
                    <ThemedText type="smallBold">{exercise.exerciseName}</ThemedText>
                    <ThemedText type="small" themeColor="mutedText">
                      {formatExerciseSummary(exercise, t)}
                    </ThemedText>
                  </View>
                  <Pressable
                    accessibilityLabel={String(t('routines.day.editExerciseConfigA11y', { name: exercise.exerciseName }))}
                    onPress={() =>
                      setConfigurator({
                        mode: 'edit',
                        exerciseIndex,
                        exercise,
                      })
                    }
                    style={({ pressed }) => [
                      styles.iconButton,
                      { backgroundColor: colors.surface, borderRadius: radius.md },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText type="smallBold">{t('common.edit')}</ThemedText>
                  </Pressable>
                </View>

                <View style={styles.exerciseActions}>
                  <SmallActionButton
                    accessibilityLabel={String(t('routines.day.moveExerciseUpA11y', { name: exercise.exerciseName }))}
                    disabled={exerciseIndex === 0}
                    label={String(t('routines.day.moveUpShort'))}
                    onPress={() => moveExercise(exerciseIndex, exerciseIndex - 1)}
                  />
                  <SmallActionButton
                    accessibilityLabel={String(t('routines.day.moveExerciseDownA11y', { name: exercise.exerciseName }))}
                    disabled={exerciseIndex === exerciseFields.length - 1}
                    label={String(t('routines.day.moveDownShort'))}
                    onPress={() => moveExercise(exerciseIndex, exerciseIndex + 1)}
                  />
                  <SmallActionButton
                    accessibilityLabel={String(t('routines.day.removeExerciseA11y', { name: exercise.exerciseName }))}
                    label={String(t('routines.day.removeShort'))}
                    onPress={() => removeExercise(exerciseIndex)}
                    danger
                  />
                </View>
              </ThemedView>
            );
          })}

          <Pressable
            accessibilityLabel={String(
              t('routines.day.addExerciseA11y', {
                day: t('routines.day.titleFallback', { number: dayIndex + 1 }),
              }),
            )}
            testID={`routine-day-${dayIndex + 1}-add-exercise`}
            onPress={() => setIsPickerVisible(true)}
            style={({ pressed }) => [
              styles.addExerciseButton,
              {
                borderColor: colors.primary,
                borderRadius: radius.md,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={{ color: colors.primary }}>
              + {t('routines.form.addExercise')}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}

      <ExercisePicker
        visible={isPickerVisible}
        onClose={() => setIsPickerVisible(false)}
        onSelect={(exercise) => {
          setIsPickerVisible(false);
          setConfigurator({ mode: 'add', exercise });
        }}
      />
      <ExerciseConfigurator
        visible={configurator !== null}
        exerciseName={
          configurator?.mode === 'add'
            ? configurator.exercise.name
            : configurator?.exercise.exerciseName ?? ''
        }
        initialValues={
          configurator?.mode === 'edit'
            ? {
                targetSets: configurator.exercise.targetSets,
                targetRepsMin: configurator.exercise.targetRepsMin,
                targetRepsMax: configurator.exercise.targetRepsMax,
              }
            : undefined
        }
        onCancel={() => setConfigurator(null)}
        onConfirm={handleConfigConfirm}
      />
    </ThemedView>
  );
}

function SmallActionButton({
  accessibilityLabel,
  danger = false,
  disabled = false,
  label,
  onPress,
}: {
  accessibilityLabel: string;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  const { colors, radius } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.md,
          opacity: disabled ? 0.42 : pressed ? 0.74 : 1,
        },
      ]}>
      <ThemedText type="smallBold" style={{ color: danger ? colors.danger : colors.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function formatExerciseSummary(
  exercise: Partial<ExerciseFormValues>,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const sets = exercise.targetSets ?? 1;
  const reps = formatReps(exercise.targetRepsMin, exercise.targetRepsMax, t);

  return `${sets}x ${reps}`;
}

function formatReps(
  min: number | undefined,
  max: number | undefined,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (min && max) {
    return min === max
      ? String(t('routines.exerciseConfig.plusReps', { count: min })).replace('+', '')
      : `${min}-${max} ${t('common.reps')}`;
  }

  if (min) return String(t('routines.exerciseConfig.plusReps', { count: min }));
  if (max) return String(t('routines.exerciseConfig.upToReps', { count: max }));
  return String(t('routines.exerciseConfig.freeReps'));
}

function translateRoutineMessage(
  message: string,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  return message.startsWith('routines.') ? String(t(message)) : message;
}

const styles = StyleSheet.create({
  addExerciseButton: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  badge: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 12,
  },
  card: {
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dayActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayNameInput: {
    borderBottomWidth: 1,
    fontWeight: '700',
    minHeight: 48,
    paddingVertical: 4,
  },
  dayTitleWrap: {
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseCard: {
    gap: 12,
    padding: 12,
  },
  exerciseCopy: {
    flex: 1,
    gap: 2,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  expandButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  expandedContent: {
    gap: 12,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  inlineError: {
    borderWidth: 1,
    padding: 12,
  },
  pressed: {
    opacity: 0.74,
  },
  smallButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: 12,
  },
});
