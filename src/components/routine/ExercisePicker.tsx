import { FlashList } from '@shopify/flash-list';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExerciseFilterButton } from '@/components/exercise/ExerciseFilterButton';
import { ExerciseFilterSheet } from '@/components/exercise/ExerciseFilterSheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Exercise, Equipment, MuscleGroup } from '@/domain/entities';
import {
  buildEquipmentFilterOptions,
  buildMuscleFilterOptions,
  getEquipmentLabel,
  getMuscleFilterLabel,
} from '@/features/exercises/exerciseFilterOptions';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { ExerciseRepo } from '@/storage/repositories/exerciseRepo';
import { MuscleGroupRepo } from '@/storage/repositories/muscleGroupRepo';

export type ExercisePickerSelection = Pick<Exercise, 'id' | 'name'>;

type ExercisePickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExercisePickerSelection) => void;
};

export function ExercisePicker({ visible, onClose, onSelect }: ExercisePickerProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { i18n, t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeFilterSheet, setActiveFilterSheet] = useState<'equipment' | 'muscle' | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, visible]);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    async function loadFilters() {
      setIsLoading(true);
      const db = await getDatabase();
      const exerciseRepo = new ExerciseRepo(db);
      const muscleRepo = new MuscleGroupRepo(db);
      const [exerciseRows, muscleRows] = await Promise.all([
        exerciseRepo.getAll(),
        muscleRepo.getAll(),
      ]);

      if (!isMounted) return;
      setAllExercises(exerciseRows);
      setExercises(exerciseRows);
      setMuscles(muscleRows);
      setIsLoading(false);
    }

    loadFilters().catch(() => {
      if (isMounted) {
        setAllExercises([]);
        setExercises([]);
        setMuscles([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    async function runSearch() {
      setIsLoading(true);
      const db = await getDatabase();
      const exerciseRepo = new ExerciseRepo(db);
      const baseRows = debouncedQuery.length > 0
        ? await exerciseRepo.search(debouncedQuery)
        : await exerciseRepo.getAll();

      let nextRows = baseRows;

      if (selectedMuscleId) {
        const muscleRows = await exerciseRepo.getByMuscle(selectedMuscleId);
        const muscleExerciseIds = new Set(muscleRows.map((exercise) => exercise.id));
        nextRows = nextRows.filter((exercise) => muscleExerciseIds.has(exercise.id));
      }

      if (selectedEquipment) {
        nextRows = nextRows.filter((exercise) => exercise.equipment === selectedEquipment);
      }

      if (isMounted) {
        setExercises(nextRows);
        setIsLoading(false);
      }
    }

    runSearch().catch(() => {
      if (isMounted) {
        setExercises([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedEquipment, selectedMuscleId, visible]);

  const visibleEquipmentOptions = useMemo(
    () => {
      const availableEquipment = new Set(allExercises.map((exercise) => exercise.equipment));

      return buildEquipmentFilterOptions(t)
        .filter((option) => option.value === null || availableEquipment.has(option.value))
        .map((option) => option);
    },
    [allExercises, t],
  );

  const muscleFilterOptions = useMemo(
    () => buildMuscleFilterOptions(muscles, i18n.language, t),
    [i18n.language, muscles, t],
  );
  const selectedEquipmentLabel = selectedEquipment
    ? String(t(`exercises.equipmentOptions.${selectedEquipment}`))
    : String(t('exercises.all'));
  const selectedMuscleLabel = getMuscleFilterLabel(muscles, selectedMuscleId, i18n.language, t);

  const renderExercise = useCallback(
    ({ item }: { item: Exercise }) => (
      <Pressable
        accessibilityLabel={String(t('exercises.a11y.selectExercise', { name: item.name }))}
        testID={`exercise-picker-option-${item.id}`}
        onPress={() => {
          onSelect({ id: item.id, name: item.name });
          onClose();
        }}
        style={({ pressed }) => [
          styles.exerciseRow,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            opacity: pressed ? 0.74 : 1,
          },
        ]}>
        <View
          style={[
            styles.equipmentIcon,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: radius.sm,
            },
          ]}>
          <ThemedText type="code" style={{ color: colors.primary }}>
            {getEquipmentLabel(t, item.equipment).slice(0, 2).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.exerciseText}>
          <ThemedText type="smallBold">{item.name}</ThemedText>
          <ThemedText type="small" themeColor="mutedText">
            {t(`exercises.equipmentOptions.${item.equipment}`)} · {t(`exercises.categoryOptions.${item.category}`)}
          </ThemedText>
        </View>
      </Pressable>
    ),
    [colors, onClose, onSelect, radius, t],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <BottomSheetModalProvider>
          <ThemedView
            type="surface"
            style={[
              styles.sheet,
              {
                borderColor: colors.border,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                padding: spacing.four,
              },
            ]}>
            <View style={styles.header}>
              <View>
                <ThemedText type="smallBold" themeColor="mutedText">
                  {t('exercises.library')}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.title}>
                  {t('routines.form.addExercise')}
                </ThemedText>
              </View>
              <Pressable
                accessibilityLabel={String(t('exercises.a11y.closePicker'))}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: colors.surfaceElevated, borderRadius: radius.md },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">{t('common.close')}</ThemedText>
              </Pressable>
            </View>

            <TextInput
              accessibilityLabel={String(t('exercises.a11y.search'))}
              testID="exercise-picker-search"
              onChangeText={setQuery}
              placeholder={String(t('exercises.searchPlaceholder'))}
              placeholderTextColor={colors.mutedText}
              style={[
                styles.searchInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: typography.size.md,
                },
              ]}
              value={query}
            />

            <View style={styles.filterButtonRow}>
              <ExerciseFilterButton
                label={String(t('exercises.equipment'))}
                valueLabel={selectedEquipmentLabel}
                selected={selectedEquipment !== null}
                accessibilityLabel={String(
                  t('exercises.a11y.filterCurrent', {
                    filter: t('exercises.equipment'),
                    selection: selectedEquipmentLabel,
                  }),
                )}
                onPress={() => setActiveFilterSheet('equipment')}
              />
              <ExerciseFilterButton
                label={String(t('exercises.muscles'))}
                valueLabel={selectedMuscleLabel}
                selected={selectedMuscleId !== null}
                accessibilityLabel={String(
                  t('exercises.a11y.filterCurrent', {
                    filter: t('exercises.muscles'),
                    selection: selectedMuscleLabel,
                  }),
                )}
                onPress={() => setActiveFilterSheet('muscle')}
              />
            </View>

            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : null}

            <FlashList
              data={exercises}
              keyExtractor={(item) => item.id}
              renderItem={renderExercise}
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.emptyState}>
                    <ThemedText type="smallBold">{t('exercises.emptyTitle')}</ThemedText>
                  </View>
                ) : null
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </ThemedView>

          <ExerciseFilterSheet
            visible={activeFilterSheet === 'equipment'}
            title={String(t('exercises.equipment'))}
            options={[...visibleEquipmentOptions]}
            selectedValue={selectedEquipment}
            onSelect={(equipment) => {
              setSelectedEquipment(equipment);
              setActiveFilterSheet(null);
            }}
            onDismiss={() => setActiveFilterSheet(null)}
          />

          <ExerciseFilterSheet
            visible={activeFilterSheet === 'muscle'}
            title={String(t('exercises.muscles'))}
            options={muscleFilterOptions}
            selectedValue={selectedMuscleId}
            onSelect={(muscleId) => {
              setSelectedMuscleId(muscleId);
              setActiveFilterSheet(null);
            }}
            onDismiss={() => setActiveFilterSheet(null)}
          />
        </BottomSheetModalProvider>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  equipmentIcon: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  exerciseRow: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    padding: 12,
  },
  exerciseText: {
    flex: 1,
    gap: 2,
  },
  filterButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loader: {
    marginVertical: 12,
  },
  pressed: {
    opacity: 0.74,
  },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  separator: {
    height: 10,
  },
  sheet: {
    borderTopWidth: 1,
    height: '86%',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
  },
});
