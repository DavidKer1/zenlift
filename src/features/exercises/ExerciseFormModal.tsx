import { zodResolver } from '@hookform/resolvers/zod';
import type { SQLiteDatabase } from 'expo-sqlite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod/v4';

import type {
  Equipment,
  Exercise,
  ExerciseCategory,
  ExerciseWithMuscles,
  MuscleGroup,
  MuscleRole,
} from '@/domain/entities';
import {
  ExerciseRepo,
  type MuscleEntry,
  type UpdateExerciseData,
} from '@/storage/repositories/exerciseRepo';
import { MuscleGroupRepo } from '@/storage/repositories/muscleGroupRepo';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { radius, spacing, typography, zenliftColors } from '@/theme';

const colors = zenliftColors.light;
const DUPLICATE_NAME_MESSAGE = 'Ya existe un ejercicio con este nombre';

const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'Barra' },
  { value: 'dumbbell', label: 'Mancuernas' },
  { value: 'machine', label: 'Máquina' },
  { value: 'cable', label: 'Cable' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'smith_machine', label: 'Smith' },
  { value: 'ez_bar', label: 'Barra Z' },
  { value: 'cardio_machine', label: 'Cardio' },
] as const satisfies ReadonlyArray<{ value: Equipment; label: string }>;

const CATEGORY_OPTIONS = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobility', label: 'Movilidad' },
  { value: 'core', label: 'Core' },
] as const satisfies ReadonlyArray<{ value: ExerciseCategory; label: string }>;

const EQUIPMENT_VALUES = EQUIPMENT_OPTIONS.map((option) => option.value);
const CATEGORY_VALUES = CATEGORY_OPTIONS.map((option) => option.value);

export const exerciseFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'Mínimo 2 caracteres'),
  primaryMuscleGroupId: z.string().min(1, 'Selecciona un músculo principal'),
  equipment: z
    .string()
    .min(1, 'Selecciona el equipamiento')
    .refine((value) => isEquipment(value), {
      message: 'Selecciona el equipamiento',
    }),
  category: z
    .string()
    .min(1, 'Selecciona la categoría')
    .refine((value) => isExerciseCategory(value), {
      message: 'Selecciona la categoría',
    }),
  secondaryMuscleGroupIds: z.array(z.string()),
  notes: z.string().optional(),
});

export type ExerciseFormData = z.infer<typeof exerciseFormSchema>;

const resolveExerciseForm = zodResolver as unknown as (
  schema: typeof exerciseFormSchema,
) => Resolver<ExerciseFormData>;

export interface ExerciseFormModalProps {
  visible: boolean;
  exercise?: ExerciseWithMuscles | null;
  db: SQLiteDatabase;
  onClose: () => void;
  onSave: (exercise: Exercise) => void | Promise<void>;
}

type PickerOption = {
  value: string;
  label: string;
  color?: string;
};

type ExerciseMuscleRoleRow = {
  muscle_group_id: string;
  role: MuscleRole;
};

const EMPTY_FORM_VALUES = {
  name: '',
  primaryMuscleGroupId: '',
  equipment: '',
  category: '',
  secondaryMuscleGroupIds: [],
  notes: '',
} satisfies ExerciseFormData;

function isEquipment(value: string): boolean {
  return EQUIPMENT_VALUES.includes(value as (typeof EQUIPMENT_VALUES)[number]);
}

function isExerciseCategory(value: string): boolean {
  return CATEGORY_VALUES.includes(value as ExerciseCategory);
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function normalizeNotes(notes?: string): string | null {
  const trimmedNotes = notes?.trim() ?? '';
  return trimmedNotes.length > 0 ? trimmedNotes : null;
}

function buildMuscleEntries(data: ExerciseFormData): MuscleEntry[] {
  return [
    { muscleGroupId: data.primaryMuscleGroupId, role: 'primary' },
    ...data.secondaryMuscleGroupIds.map((muscleGroupId) => ({
      muscleGroupId,
      role: 'secondary' as const,
    })),
  ];
}

function toEntryKey(entry: MuscleEntry): string {
  return `${entry.muscleGroupId}:${entry.role}`;
}

function getChangedExerciseFields(
  exercise: Exercise,
  data: ExerciseFormData,
): UpdateExerciseData {
  const notes = normalizeNotes(data.notes);
  const updates: UpdateExerciseData = {};

  if (exercise.name !== data.name) {
    updates.name = data.name;
  }
  if (exercise.equipment !== data.equipment) {
    updates.equipment = data.equipment as Equipment;
  }
  if (exercise.category !== data.category) {
    updates.category = data.category as ExerciseCategory;
  }
  if (exercise.notes !== notes) {
    updates.notes = notes;
  }

  return updates;
}

async function loadExerciseMuscleEntries(
  db: SQLiteDatabase,
  exerciseRepo: ExerciseRepo,
  exercise: ExerciseWithMuscles,
): Promise<MuscleEntry[]> {
  const muscleGroups = await exerciseRepo.getMuscles(exercise.id);
  const roleRows = await db.getAllAsync<ExerciseMuscleRoleRow>(
    'SELECT muscle_group_id, role FROM exercise_muscles WHERE exercise_id = ?',
    exercise.id,
  );
  const loadedMuscleIds = new Set(muscleGroups.map((muscle) => muscle.id));

  if (roleRows.length > 0) {
    return roleRows
      .filter((row) => loadedMuscleIds.size === 0 || loadedMuscleIds.has(row.muscle_group_id))
      .map((row) => ({
        muscleGroupId: row.muscle_group_id,
        role: row.role,
      }));
  }

  return exercise.muscles.map((muscle) => ({
    muscleGroupId: muscle.muscle_group_id,
    role: muscle.role,
  }));
}

async function syncMuscleEntries(
  exerciseRepo: ExerciseRepo,
  exerciseId: string,
  previousEntries: MuscleEntry[],
  nextEntries: MuscleEntry[],
): Promise<void> {
  const previousKeys = new Set(previousEntries.map(toEntryKey));
  const nextKeys = new Set(nextEntries.map(toEntryKey));

  const entriesToRemove = previousEntries.filter(
    (entry) => !nextKeys.has(toEntryKey(entry)),
  );
  const entriesToAdd = nextEntries.filter(
    (entry) => !previousKeys.has(toEntryKey(entry)),
  );

  for (const entry of entriesToRemove) {
    await exerciseRepo.removeMuscle(exerciseId, entry.muscleGroupId);
  }

  for (const entry of entriesToAdd) {
    await exerciseRepo.addMuscle(exerciseId, entry.muscleGroupId, entry.role);
  }
}

function OptionPicker({
  label,
  options,
  value,
  error,
  accessibilityLabel,
  onChange,
}: {
  label: string;
  options: readonly PickerOption[];
  value: string;
  error?: string;
  accessibilityLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionList}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityLabel={`${accessibilityLabel}: ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              {option.color ? (
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: option.color },
                  ]}
                />
              ) : null}
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function MultiSelectChips({
  label,
  muscles,
  selectedIds,
  primaryMuscleGroupId,
  onChange,
}: {
  label: string;
  muscles: MuscleGroup[];
  selectedIds: string[];
  primaryMuscleGroupId: string;
  onChange: (selectedIds: string[]) => void;
}) {
  const secondaryOptions = muscles.filter(
    (muscle) => muscle.id !== primaryMuscleGroupId,
  );

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      >
        {secondaryOptions.map((muscle) => {
          const isSelected = selectedIds.includes(muscle.id);

          return (
            <Pressable
              key={muscle.id}
              accessibilityLabel={`Músculo secundario: ${muscle.display_name_es}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                if (isSelected) {
                  onChange(selectedIds.filter((id) => id !== muscle.id));
                  return;
                }

                onChange([...selectedIds, muscle.id]);
              }}
              style={({ pressed }) => [
                styles.chip,
                isSelected && {
                  backgroundColor: muscle.color,
                  borderColor: muscle.color,
                },
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {muscle.display_name_es}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function ExerciseFormModal({
  visible,
  exercise = null,
  db,
  onClose,
  onSave,
}: ExerciseFormModalProps) {
  const exerciseRepo = useMemo(() => new ExerciseRepo(db), [db]);
  const muscleGroupRepo = useMemo(() => new MuscleGroupRepo(db), [db]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [initialMuscleEntries, setInitialMuscleEntries] = useState<MuscleEntry[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormData>({
    resolver: resolveExerciseForm(exerciseFormSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  const primaryMuscleGroupId = watch('primaryMuscleGroupId');
  const secondaryMuscleGroupIds = watch('secondaryMuscleGroupIds');
  const isEditMode = Boolean(exercise);
  const muscleOptions = useMemo<PickerOption[]>(
    () =>
      muscleGroups.map((muscle) => ({
        value: muscle.id,
        label: muscle.display_name_es,
        color: muscle.color,
      })),
    [muscleGroups],
  );

  const checkDuplicateName = useCallback(
    async (name: string, excludeId?: string) => {
      const normalizedSubmittedName = normalizeName(name);
      const matches = await exerciseRepo.search(name.trim());

      return matches.some(
        (match) =>
          match.id !== excludeId &&
          normalizeName(match.name) === normalizedSubmittedName,
      );
    },
    [exerciseRepo],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isCancelled = false;

    async function loadFormState() {
      setIsLoadingForm(true);
      setSubmitError(null);
      clearErrors();

      try {
        const muscles = await muscleGroupRepo.getAll();

        if (isCancelled) {
          return;
        }

        setMuscleGroups(muscles);

        if (!exercise) {
          setInitialMuscleEntries([]);
          reset(EMPTY_FORM_VALUES);
          return;
        }

        const muscleEntries = await loadExerciseMuscleEntries(
          db,
          exerciseRepo,
          exercise,
        );

        if (isCancelled) {
          return;
        }

        const primaryMuscle = muscleEntries.find(
          (entry) => entry.role === 'primary',
        );
        const secondaryMuscles = muscleEntries
          .filter((entry) => entry.role === 'secondary')
          .map((entry) => entry.muscleGroupId);

        setInitialMuscleEntries(muscleEntries);
        reset({
          name: exercise.name,
          primaryMuscleGroupId: primaryMuscle?.muscleGroupId ?? '',
          equipment: exercise.equipment,
          category: exercise.category,
          secondaryMuscleGroupIds: secondaryMuscles,
          notes: exercise.notes ?? '',
        });
      } catch (error) {
        if (!isCancelled) {
          setSubmitError('No se pudo cargar el formulario.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingForm(false);
        }
      }
    }

    void loadFormState();

    return () => {
      isCancelled = true;
    };
  }, [
    clearErrors,
    db,
    exercise,
    exerciseRepo,
    muscleGroupRepo,
    reset,
    visible,
  ]);

  useEffect(() => {
    if (
      primaryMuscleGroupId &&
      secondaryMuscleGroupIds.includes(primaryMuscleGroupId)
    ) {
      setValue(
        'secondaryMuscleGroupIds',
        secondaryMuscleGroupIds.filter((id) => id !== primaryMuscleGroupId),
        { shouldDirty: true, shouldValidate: true },
      );
    }
  }, [primaryMuscleGroupId, secondaryMuscleGroupIds, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);

    const normalizedData: ExerciseFormData = {
      ...data,
      name: data.name.trim(),
      secondaryMuscleGroupIds: data.secondaryMuscleGroupIds.filter(
        (id) => id !== data.primaryMuscleGroupId,
      ),
    };

    const hasDuplicateName = await checkDuplicateName(
      normalizedData.name,
      exercise?.id,
    );

    if (hasDuplicateName) {
      setError('name', {
        type: 'validate',
        message: DUPLICATE_NAME_MESSAGE,
      });
      return;
    }

    try {
      const nextMuscleEntries = buildMuscleEntries(normalizedData);

      if (!exercise) {
        const createdExercise = await exerciseRepo.create(
          {
            name: normalizedData.name,
            equipment: normalizedData.equipment as Equipment,
            category: normalizedData.category as ExerciseCategory,
            is_custom: 1,
            notes: normalizeNotes(normalizedData.notes),
          },
          nextMuscleEntries,
        );

        await onSave(createdExercise);
        onClose();
        return;
      }

      const updatedExercise = await exerciseRepo.update(
        exercise.id,
        getChangedExerciseFields(exercise, normalizedData),
      );

      await syncMuscleEntries(
        exerciseRepo,
        exercise.id,
        initialMuscleEntries,
        nextMuscleEntries,
      );

      await onSave(updatedExercise ?? exercise);
      onClose();
    } catch (error) {
      setSubmitError('No se pudo guardar el ejercicio. Inténtalo de nuevo.');
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Biblioteca</Text>
            <Text style={styles.title}>
              {isEditMode ? 'Editar ejercicio' : 'Nuevo ejercicio'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Cerrar formulario de ejercicio"
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoadingForm ? (
            <View style={styles.loadingPanel}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <>
              <Controller
                control={control}
                name="name"
                render={({ field: { onBlur, onChange, value } }) => (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                      accessibilityLabel="Nombre del ejercicio"
                      autoCapitalize="words"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        if (errors.name?.message === DUPLICATE_NAME_MESSAGE) {
                          clearErrors('name');
                        }
                      }}
                      placeholder="Press inclinado con mancuernas"
                      placeholderTextColor={colors.mutedText}
                      returnKeyType="next"
                      style={[
                        styles.input,
                        errors.name && styles.inputError,
                      ]}
                      value={value}
                    />
                    {errors.name?.message ? (
                      <Text style={styles.errorText}>{errors.name.message}</Text>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="primaryMuscleGroupId"
                render={({ field: { onChange, value } }) => (
                  <OptionPicker
                    label="Músculo principal"
                    accessibilityLabel="Seleccionar músculo principal"
                    options={muscleOptions}
                    value={value}
                    onChange={onChange}
                    error={errors.primaryMuscleGroupId?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="secondaryMuscleGroupIds"
                render={({ field: { onChange, value } }) => (
                  <MultiSelectChips
                    label="Músculos secundarios"
                    muscles={muscleGroups}
                    selectedIds={value}
                    primaryMuscleGroupId={primaryMuscleGroupId}
                    onChange={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="equipment"
                render={({ field: { onChange, value } }) => (
                  <OptionPicker
                    label="Equipamiento"
                    accessibilityLabel="Seleccionar equipamiento"
                    options={EQUIPMENT_OPTIONS}
                    value={value}
                    onChange={onChange}
                    error={errors.equipment?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <OptionPicker
                    label="Categoría"
                    accessibilityLabel="Seleccionar categoría"
                    options={CATEGORY_OPTIONS}
                    value={value}
                    onChange={onChange}
                    error={errors.category?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field: { onBlur, onChange, value } }) => (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Notas</Text>
                    <TextInput
                      accessibilityLabel="Notas del ejercicio"
                      multiline
                      numberOfLines={4}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Detalles de técnica, agarre o rango de movimiento"
                      placeholderTextColor={colors.mutedText}
                      style={[styles.input, styles.textArea]}
                      textAlignVertical="top"
                      value={value}
                    />
                  </View>
                )}
              />

              {submitError ? (
                <Text style={styles.submitError}>{submitError}</Text>
              ) : null}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityLabel="Cancelar formulario de ejercicio"
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={onClose}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && !isSubmitting && styles.optionPressed,
              isSubmitting && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={
              isEditMode ? 'Guardar cambios del ejercicio' : 'Crear ejercicio'
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting || isLoadingForm }}
            disabled={isSubmitting || isLoadingForm}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !isSubmitting && !isLoadingForm && styles.primaryButtonPressed,
              (isSubmitting || isLoadingForm) && styles.disabledButton,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : null}
            <Text style={styles.primaryButtonText}>
              {isSubmitting
                ? 'Guardando...'
                : isEditMode
                  ? 'Guardar cambios'
                  : 'Crear ejercicio'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 88,
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.three,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.three,
  },
  eyebrow: {
    color: colors.mutedText,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  content: {
    padding: spacing.four,
    paddingBottom: spacing.five,
    gap: spacing.four,
  },
  loadingPanel: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.two,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
  fieldGroup: {
    gap: spacing.two,
  },
  label: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  input: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    paddingHorizontal: spacing.three,
    paddingVertical: spacing.two,
  },
  textArea: {
    minHeight: 120,
  },
  inputError: {
    borderColor: colors.danger,
  },
  optionList: {
    gap: spacing.two,
  },
  option: {
    minHeight: 48,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.three,
    paddingVertical: spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.two,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionPressed: {
    opacity: 0.72,
  },
  optionText: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  optionTextSelected: {
    color: colors.text,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
  },
  chipList: {
    gap: spacing.two,
    paddingRight: spacing.four,
  },
  chip: {
    minHeight: 48,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  submitError: {
    color: colors.danger,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.semibold,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.three,
    flexDirection: 'row',
    gap: spacing.two,
  },
  primaryButton: {
    minHeight: 52,
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.two,
    paddingHorizontal: spacing.three,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.three,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  disabledButton: {
    opacity: 0.56,
  },
});
