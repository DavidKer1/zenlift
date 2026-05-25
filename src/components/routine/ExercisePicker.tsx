import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Exercise, ExerciseCategory, Equipment, MuscleGroup } from '@/domain/entities';
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

const equipmentLabels: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuerna',
  machine: 'Maquina',
  cable: 'Cable',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  smith_machine: 'Smith',
  ez_bar: 'Barra EZ',
  cardio_machine: 'Cardio',
  other: 'Otro',
};

const categoryLabels: Record<ExerciseCategory, string> = {
  strength: 'Fuerza',
  cardio: 'Cardio',
  mobility: 'Movilidad',
  core: 'Core',
};

const equipmentIconLabels: Record<Equipment, string> = {
  barbell: 'BB',
  dumbbell: 'DB',
  machine: 'MA',
  cable: 'CB',
  bodyweight: 'BW',
  kettlebell: 'KB',
  smith_machine: 'SM',
  ez_bar: 'EZ',
  cardio_machine: 'CA',
  other: 'OT',
};

export function ExercisePicker({ visible, onClose, onSelect }: ExercisePickerProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
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

      if (selectedCategory) {
        nextRows = nextRows.filter((exercise) => exercise.category === selectedCategory);
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
  }, [debouncedQuery, selectedCategory, selectedEquipment, selectedMuscleId, visible]);

  const equipmentOptions = useMemo(
    () => Array.from(new Set(allExercises.map((exercise) => exercise.equipment))).sort(),
    [allExercises],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(allExercises.map((exercise) => exercise.category))).sort(),
    [allExercises],
  );

  const renderExercise = useCallback(
    ({ item }: { item: Exercise }) => (
      <Pressable
        accessibilityLabel={`Seleccionar ejercicio ${item.name}`}
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
            {equipmentIconLabels[item.equipment]}
          </ThemedText>
        </View>
        <View style={styles.exerciseText}>
          <ThemedText type="smallBold">{item.name}</ThemedText>
          <ThemedText type="small" themeColor="mutedText">
            {equipmentLabels[item.equipment]} · {categoryLabels[item.category]}
          </ThemedText>
        </View>
      </Pressable>
    ),
    [colors, onClose, onSelect, radius],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
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
                Biblioteca
              </ThemedText>
              <ThemedText type="subtitle" style={styles.title}>
                Agregar ejercicio
              </ThemedText>
            </View>
            <Pressable
              accessibilityLabel="Cerrar selector de ejercicios"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.surfaceElevated, borderRadius: radius.md },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold">Cerrar</ThemedText>
            </Pressable>
          </View>

          <TextInput
            accessibilityLabel="Buscar ejercicios"
            onChangeText={setQuery}
            placeholder="Buscar ejercicio"
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}>
            <FilterChip
              active={!selectedMuscleId && !selectedEquipment && !selectedCategory}
              label="Todos"
              onPress={() => {
                setSelectedMuscleId(null);
                setSelectedEquipment(null);
                setSelectedCategory(null);
              }}
            />
            {muscles.map((muscle) => (
              <FilterChip
                key={muscle.id}
                active={selectedMuscleId === muscle.id}
                label={muscle.display_name_es}
                onPress={() => setSelectedMuscleId((current) => (current === muscle.id ? null : muscle.id))}
              />
            ))}
            {equipmentOptions.map((equipment) => (
              <FilterChip
                key={equipment}
                active={selectedEquipment === equipment}
                label={equipmentLabels[equipment]}
                onPress={() =>
                  setSelectedEquipment((current) => (current === equipment ? null : equipment))
                }
              />
            ))}
            {categoryOptions.map((category) => (
              <FilterChip
                key={category}
                active={selectedCategory === category}
                label={categoryLabels[category]}
                onPress={() =>
                  setSelectedCategory((current) => (current === category ? null : category))
                }
              />
            ))}
          </ScrollView>

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
                  <ThemedText type="smallBold">No se encontraron ejercicios</ThemedText>
                </View>
              ) : null
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

function FilterChip({
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
      accessibilityLabel={`Filtrar por ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surfaceElevated,
          borderRadius: radius.pill,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: active ? colors.surface : colors.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 16,
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
  filterContent: {
    gap: 8,
    paddingVertical: 12,
  },
  filterScroll: {
    flexGrow: 0,
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
