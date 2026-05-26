import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, type Resolver } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { DayEditor } from '@/components/routine/DayEditor';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createDefaultDay } from '@/features/routine/routineFormMapping';
import {
  createEmptyRoutineFormValues,
  routineFormSchema,
  routineGoalOptions,
  type RoutineFormValues,
} from '@/features/routine/routineFormSchema';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type RoutineFormProps = {
  initialData?: RoutineFormValues;
  onSubmit: (data: RoutineFormValues) => Promise<void>;
  submitLabel?: string;
  title?: string;
};

const goalLabels: Record<NonNullable<RoutineFormValues['goal']>, string> = {
  hipertrofia: 'Hipertrofia',
  fuerza: 'Fuerza',
  resistencia: 'Resistencia',
};

export function RoutineForm({
  initialData,
  onSubmit,
  submitLabel,
  title = initialData ? 'Editar rutina' : 'Crear rutina',
}: RoutineFormProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const allowLeaveRef = useRef(false);
  const defaultValues = useMemo(
    () => initialData ?? createEmptyRoutineFormValues(),
    [initialData],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema as never) as Resolver<RoutineFormValues>,
    defaultValues,
  });

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
    move: moveDay,
  } = useFieldArray({
    control,
    name: 'days',
    keyName: 'fieldKey',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const confirmDiscard = useCallback(
    (onDiscard: () => void) => {
      Alert.alert('¿Descartar cambios?', 'Los cambios no guardados se perderán.', [
        { text: 'Seguir editando', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: onDiscard,
        },
      ]);
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!isDirty || allowLeaveRef.current) return;

      event.preventDefault();
      confirmDiscard(() => {
        allowLeaveRef.current = true;
        navigation.dispatch(event.data.action);
      });
    });

    return unsubscribe;
  }, [confirmDiscard, isDirty, navigation]);

  const validationMessages = collectValidationMessages(errors);

  async function submit(data: RoutineFormValues) {
    setSubmitError(null);

    try {
      allowLeaveRef.current = true;
      await onSubmit(data);
      reset(data);
      allowLeaveRef.current = false;
    } catch (error) {
      allowLeaveRef.current = false;
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar la rutina');
    }
  }

  function handleBack() {
    if (!isDirty) {
      router.back();
      return;
    }

    confirmDiscard(() => {
      allowLeaveRef.current = true;
      router.back();
    });
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.four,
            paddingBottom: 132,
          },
        ]}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface, borderRadius: radius.md },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">Volver</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.screenTitle}>
            {title}
          </ThemedText>
        </View>

        {submitError || validationMessages.length > 0 ? (
          <ThemedView
            type="primarySoft"
            style={[styles.errorSummary, { borderColor: colors.primary, borderRadius: radius.md }]}>
            {submitError ? (
              <ThemedText type="smallBold" style={{ color: colors.danger }}>
                ! {submitError}
              </ThemedText>
            ) : null}
            {validationMessages.map((message) => (
              <ThemedText key={message} type="smallBold" style={{ color: colors.danger }}>
                ! {message}
              </ThemedText>
            ))}
          </ThemedView>
        ) : null}

        <ThemedView
          type="surface"
          style={[
            styles.section,
            {
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.three,
            },
          ]}>
          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" themeColor="mutedText">
              Nombre de la rutina
            </ThemedText>
            <Controller
              control={control}
              name="name"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  accessibilityLabel="Nombre de la rutina"
                  testID="routine-name-input"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Push Day"
                  placeholderTextColor={colors.mutedText}
                  style={[
                    styles.titleInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      fontSize: typography.size.xl,
                    },
                  ]}
                  value={value}
                />
              )}
            />
            {errors.name?.message ? (
              <ThemedText type="small" style={{ color: colors.danger }}>
                ! {errors.name.message}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" themeColor="mutedText">
              Descripcion
            </ThemedText>
            <Controller
              control={control}
              name="description"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  accessibilityLabel="Descripcion de la rutina"
                  testID="routine-description-input"
                  multiline
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Notas opcionales"
                  placeholderTextColor={colors.mutedText}
                  style={[
                    styles.descriptionInput,
                    {
                      borderColor: colors.border,
                      color: colors.text,
                      fontSize: typography.size.md,
                    },
                  ]}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="smallBold" themeColor="mutedText">
              Objetivo
            </ThemedText>
            <Controller
              control={control}
              name="goal"
              render={({ field: { onChange, value } }) => (
                <View style={styles.goalRow}>
                  <GoalButton
                    active={value === undefined}
                    label="Sin objetivo"
                    onPress={() => onChange(undefined)}
                  />
                  {routineGoalOptions.map((goal) => (
                    <GoalButton
                      key={goal}
                      active={value === goal}
                      label={goalLabels[goal]}
                      onPress={() => onChange(goal)}
                    />
                  ))}
                </View>
              )}
            />
          </View>
        </ThemedView>

        <View style={styles.daysHeader}>
          <ThemedText type="smallBold" themeColor="mutedText">
            Dias
          </ThemedText>
          <ThemedText type="small" themeColor="mutedText">
            {dayFields.length} configurados
          </ThemedText>
        </View>

        {dayFields.map((field, index) => (
          <DayEditor
            key={field.fieldKey}
            control={control}
            dayIndex={index}
            dayCount={dayFields.length}
            onRemoveDay={() => removeDay(index)}
            onMoveDayUp={() => moveDay(index, index - 1)}
            onMoveDayDown={() => moveDay(index, index + 1)}
          />
        ))}

        <Pressable
          accessibilityLabel="Agregar dia a la rutina"
          testID="routine-add-day"
          onPress={() => appendDay(createDefaultDay(dayFields.length + 1))}
          style={({ pressed }) => [
            styles.addDayButton,
            {
              borderColor: colors.primary,
              borderRadius: radius.md,
            },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={{ color: colors.primary }}>
            + Agregar dia
          </ThemedText>
        </Pressable>
      </ScrollView>

      <ThemedView type="background" style={[styles.footer, { padding: spacing.four }]}>
        <Pressable
          accessibilityLabel={submitLabel ?? (initialData ? 'Guardar cambios' : 'Crear rutina')}
          testID="routine-submit"
          disabled={isSubmitting}
          onPress={handleSubmit(submit)}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
            },
            (pressed || isSubmitting) && styles.pressed,
          ]}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <ThemedText type="smallBold" style={[styles.submitText, { color: colors.surface }]}>
              {submitLabel ?? (initialData ? 'Guardar cambios' : 'Crear rutina')}
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

function GoalButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { colors, radius } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={`Seleccionar objetivo ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.goalButton,
        {
          backgroundColor: active ? colors.primary : colors.surfaceElevated,
          borderRadius: radius.md,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: active ? colors.surface : colors.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function collectValidationMessages(errors: ReturnType<typeof useForm<RoutineFormValues>>['formState']['errors']) {
  const messages = new Set<string>();

  if (errors.days && !Array.isArray(errors.days) && errors.days.message) {
    messages.add(String(errors.days.message));
  }

  if (Array.isArray(errors.days)) {
    errors.days.forEach((dayError) => {
      if (!dayError) return;
      if (dayError.exercises && !Array.isArray(dayError.exercises) && dayError.exercises.message) {
        messages.add(String(dayError.exercises.message));
      }
    });
  }

  return Array.from(messages);
}

const styles = StyleSheet.create({
  addDayButton: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 48,
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  content: {
    gap: 16,
  },
  daysHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  descriptionInput: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 88,
    padding: 12,
    textAlignVertical: 'top',
  },
  errorSummary: {
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  footer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  goalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 14,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  header: {
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  pressed: {
    opacity: 0.74,
  },
  screen: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 36,
  },
  section: {
    borderWidth: 1,
    gap: 18,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    minWidth: 48,
    paddingHorizontal: 20,
  },
  submitText: {
  },
  titleInput: {
    borderBottomWidth: 1,
    fontWeight: '700',
    minHeight: 52,
    paddingVertical: 4,
  },
});
