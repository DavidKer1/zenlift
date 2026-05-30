import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ExerciseFilterButton } from '@/components/exercise/ExerciseFilterButton';
import { ExerciseFilterSheet } from '@/components/exercise/ExerciseFilterSheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseCard } from '@/components/ui/ExerciseCard';
import { FAB } from '@/components/ui/FAB';
import { SearchBar } from '@/components/ui/SearchBar';
import type { Equipment, Exercise, MuscleGroup, SQLiteBoolean } from '@/domain/entities';
import {
  buildEquipmentFilterOptions,
  buildMuscleFilterOptions,
  getMuscleFilterLabel,
} from '@/features/exercises/exerciseFilterOptions';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { ExerciseRepo } from '@/storage/repositories/exerciseRepo';
import { MuscleGroupRepo } from '@/storage/repositories/muscleGroupRepo';

type ExerciseListItem = Exercise & {
  primaryMuscleName: string | null;
  primaryMuscleLabel: string | null;
  primaryMuscleColor: string | null;
};

type PrimaryMuscleRow = MuscleGroup & {
  exercise_id: string;
};

type Repositories = {
  db: SQLiteDatabase;
  exerciseRepo: ExerciseRepo;
  muscleGroupRepo: MuscleGroupRepo;
};

const flashListSizingProps = { estimatedItemSize: 72 } as Record<string, unknown>;

async function loadPrimaryMuscles(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<PrimaryMuscleRow>(
    `SELECT em.exercise_id, mg.*
     FROM exercise_muscles em
     JOIN muscle_groups mg ON mg.id = em.muscle_group_id
     WHERE em.role = 'primary'`,
  );

  return new Map(rows.map((row) => [row.exercise_id, row]));
}

function applyExerciseIntersection(source: Exercise[], allowed: Exercise[]) {
  const allowedIds = new Set(allowed.map((exercise) => exercise.id));

  return source.filter((exercise) => allowedIds.has(exercise.id));
}

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useZenliftTheme();
  const [repositories, setRepositories] = useState<Repositories | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeFilterSheet, setActiveFilterSheet] = useState<'equipment' | 'muscle' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const muscleFilterOptions = useMemo(
    () => buildMuscleFilterOptions(muscleGroups, i18n.language, t),
    [i18n.language, muscleGroups, t],
  );
  const selectedEquipmentLabel = selectedEquipment
    ? String(t(`exercises.equipmentOptions.${selectedEquipment}`))
    : String(t('exercises.all'));
  const selectedMuscleLabel = getMuscleFilterLabel(
    muscleGroups,
    selectedMuscleId,
    i18n.language,
    t,
  );
  const visibleEquipmentOptions = useMemo(
    () => buildEquipmentFilterOptions(t),
    [t],
  );

  useEffect(() => {
    let isActive = true;

    async function initializeRepositories() {
      try {
        const db = await getDatabase();

        if (!isActive) return;

        setRepositories({
          db,
          exerciseRepo: new ExerciseRepo(db),
          muscleGroupRepo: new MuscleGroupRepo(db),
        });
      } catch (error) {
        console.error('[ExerciseLibrary] Failed to initialize database:', error);

        if (isActive) {
          setErrorMessage(String(t('exercises.loadError')));
          setIsLoading(false);
        }
      }
    }

    initializeRepositories();

    return () => {
      isActive = false;
    };
  }, [t]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedSearchText = searchText.trim();

    if (!trimmedSearchText) {
      setDebouncedSearchText('');
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchText(trimmedSearchText);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchText]);

  useEffect(() => {
    if (!repositories) return;

    let isActive = true;
    const repos = repositories;

    async function loadMuscleGroups() {
      try {
        const groups = await repos.muscleGroupRepo.getAll();

        if (isActive) {
          setMuscleGroups(groups);
        }
      } catch (error) {
        console.error('[ExerciseLibrary] Failed to load muscle groups:', error);
      }
    }

    loadMuscleGroups();

    return () => {
      isActive = false;
    };
  }, [repositories]);

  useEffect(() => {
    if (!repositories) return;

    let isActive = true;
    const repos = repositories;

    async function loadExercises() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const baseExercises = debouncedSearchText
          ? await repos.exerciseRepo.search(debouncedSearchText)
          : await repos.exerciseRepo.getAll();

        let filteredExercises = baseExercises;

        if (selectedMuscleId) {
          const muscleMatches = await repos.exerciseRepo.getByMuscle(selectedMuscleId);
          filteredExercises = applyExerciseIntersection(filteredExercises, muscleMatches);
        }

        if (selectedEquipment) {
          const equipmentMatches = await repos.exerciseRepo.getByEquipment(selectedEquipment);
          filteredExercises = applyExerciseIntersection(filteredExercises, equipmentMatches);
        }

        const primaryMuscles = await loadPrimaryMuscles(repos.db);
        const nextExercises = filteredExercises.map<ExerciseListItem>((exercise) => {
          const primaryMuscle = primaryMuscles.get(exercise.id);

          return {
            ...exercise,
            primaryMuscleColor: primaryMuscle?.color ?? null,
            primaryMuscleLabel: primaryMuscle?.display_name_es ?? null,
            primaryMuscleName: primaryMuscle?.name ?? null,
          };
        });

        if (isActive) {
          setExercises(nextExercises);
        }
      } catch (error) {
        console.error('[ExerciseLibrary] Failed to load exercises:', error);

        if (isActive) {
          setErrorMessage(String(t('exercises.loadError')));
          setExercises([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadExercises();

    return () => {
      isActive = false;
    };
  }, [debouncedSearchText, repositories, selectedEquipment, selectedMuscleId, t]);

  const handleEquipmentSelect = useCallback((equipment: Equipment | null) => {
    setSelectedEquipment(equipment);
    setActiveFilterSheet(null);
  }, []);

  const handleMuscleSelect = useCallback((muscleId: string | null) => {
    setSelectedMuscleId(muscleId);
    setActiveFilterSheet(null);
  }, []);

  const handleExercisePress = useCallback(
    (exerciseId: string) => {
      router.push(`/exercise/${exerciseId}` as Href);
    },
    [router],
  );

  const handleCreatePress = useCallback(() => {
    router.push('/exercise/create' as Href);
  }, [router]);

  const handleFavoriteToggle = useCallback(
    async (exerciseId: string) => {
      if (!repositories) return;

      let previousFavorite: SQLiteBoolean = 0;

      setExercises((current) =>
        current.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;

          previousFavorite = exercise.is_favorite;

          return {
            ...exercise,
            is_favorite: exercise.is_favorite === 1 ? 0 : 1,
          };
        }),
      );

      try {
        const updatedExercise = await repositories.exerciseRepo.toggleFavorite(exerciseId);

        if (updatedExercise) {
          setExercises((current) =>
            current.map((exercise) =>
              exercise.id === exerciseId
                ? { ...exercise, is_favorite: updatedExercise.is_favorite }
                : exercise,
            ),
          );
        }
      } catch (error) {
        console.error('[ExerciseLibrary] Failed to toggle favorite:', error);

        setExercises((current) =>
          current.map((exercise) =>
            exercise.id === exerciseId ? { ...exercise, is_favorite: previousFavorite } : exercise,
          ),
        );
      }
    },
    [repositories],
  );

  const renderExercise = useCallback(
    ({ item }: { item: ExerciseListItem }) => (
      <ExerciseCard
        exercise={item}
        onFavoriteToggle={handleFavoriteToggle}
        onPress={handleExercisePress}
      />
    ),
    [handleExercisePress, handleFavoriteToggle],
  );

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border,
              borderRadius: radius.pill,
            },
          ]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search_off', web: 'search_off' }}
            size={26}
            tintColor={colors.primary}
          />
        </View>
        <ThemedText type="smallBold" style={styles.emptyTitle}>
          {t('exercises.emptyTitle')}
        </ThemedText>
        {errorMessage ? (
          <ThemedText themeColor="mutedText" type="small" style={styles.emptyCaption}>
            {errorMessage}
          </ThemedText>
        ) : null}
      </View>
    );
  }, [colors.border, colors.primary, colors.primarySoft, errorMessage, isLoading, radius.pill, t]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={[styles.header, { paddingHorizontal: spacing.four, paddingTop: spacing.two }]}>
          <ThemedText type="subtitle" style={[styles.title, { color: colors.text }]}>
            {t('exercises.title')}
          </ThemedText>

          <SearchBar
            accessibilityLabel={String(t('exercises.a11y.search'))}
            clearAccessibilityLabel={String(t('exercises.a11y.clearSearch'))}
            placeholder={String(t('exercises.searchPlaceholder'))}
            value={searchText}
            onChangeText={setSearchText}
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
        </View>

        <View style={styles.listContainer}>
          <FlashList<ExerciseListItem>
            {...flashListSizingProps}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 112,
              paddingHorizontal: spacing.four,
              paddingTop: spacing.two,
            }}
            data={exercises}
            extraData={exercises}
            ItemSeparatorComponent={ListSeparator}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            renderItem={renderExercise}
          />
        </View>
      </SafeAreaView>

      <View
        pointerEvents="box-none"
        style={[
          styles.fabContainer,
          {
            bottom: insets.bottom + 92,
            right: spacing.four,
          },
        ]}>
        <FAB accessibilityLabel={String(t('exercises.create'))} onPress={handleCreatePress} />
      </View>

      <ExerciseFilterSheet
        visible={activeFilterSheet === 'equipment'}
        title={String(t('exercises.equipment'))}
        options={visibleEquipmentOptions}
        selectedValue={selectedEquipment}
        onSelect={handleEquipmentSelect}
        onDismiss={() => setActiveFilterSheet(null)}
      />

      <ExerciseFilterSheet
        visible={activeFilterSheet === 'muscle'}
        title={String(t('exercises.muscles'))}
        options={muscleFilterOptions}
        selectedValue={selectedMuscleId}
        onSelect={handleMuscleSelect}
        onDismiss={() => setActiveFilterSheet(null)}
      />
    </ThemedView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  emptyCaption: {
    maxWidth: 280,
    textAlign: 'center',
  },
  emptyIcon: {
    alignItems: 'center',
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 300,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
  },
  filterButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  header: {
    gap: 16,
    paddingBottom: 12,
  },
  listContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  separator: {
    height: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
  },
});
