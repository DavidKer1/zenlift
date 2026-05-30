import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BestPerformanceCard } from '@/components/exercise/BestPerformanceCard';
import { ExercisePRList } from '@/components/exercise/ExercisePRList';
import { RecentHistoryList } from '@/components/exercise/RecentHistoryList';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MuscleBadge } from '@/components/ui/MuscleBadge';
import type {
  Equipment,
  Exercise,
  MuscleGroup,
  PersonalRecord,
  SetLog,
} from '@/domain/entities';
import {
  getBestMetrics,
  getSessionHistory,
  getProgressData,
  type SessionSets,
} from '@/domain/services/exerciseStats';
import { getMuscleDisplayName } from '@/features/exercises/exerciseFilterOptions';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { createStartWorkoutFlowCopy, startWorkoutFlow } from '@/features/workout/StartWorkoutFlow';
import { getDatabase } from '@/storage/database/connection';
import { ExerciseRepo } from '@/storage/repositories/exerciseRepo';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';
import { muscleColors, type MuscleGroupName } from '@/theme/muscleColors';

type SetRow = SetLog & { session_id: string; started_at: string };

const equipmentIcons: Record<Equipment, string> = {
  barbell: 'dumbbell.fill',
  dumbbell: 'dumbbell.fill',
  machine: 'dumbbell.fill',
  cable: 'dumbbell.fill',
  bodyweight: 'figure.strengthtraining.traditional',
  kettlebell: 'dumbbell.fill',
  smith_machine: 'dumbbell.fill',
  ez_bar: 'dumbbell.fill',
  cardio_machine: 'figure.run',
  other: 'dumbbell.fill',
};

function groupSetsBySession(rows: SetRow[]): SessionSets[] {
  const sessionMap = new Map<string, SessionSets>();

  for (const row of rows) {
    const existing = sessionMap.get(row.session_id);
    if (existing) {
      existing.sets.push({
        id: row.id,
        workout_exercise_id: row.workout_exercise_id,
        set_number: row.set_number,
        weight: row.weight,
        reps: row.reps,
        set_type: row.set_type,
        is_completed: row.is_completed,
        completed_at: row.completed_at,
        notes: row.notes,
      });
    } else {
      sessionMap.set(row.session_id, {
        sessionId: row.session_id,
        date: row.started_at,
        sets: [
          {
            id: row.id,
            workout_exercise_id: row.workout_exercise_id,
            set_number: row.set_number,
            weight: row.weight,
            reps: row.reps,
            set_type: row.set_type,
            is_completed: row.is_completed,
            completed_at: row.completed_at,
            notes: row.notes,
          },
        ],
      });
    }
  }

  return Array.from(sessionMap.values());
}

type AllSets = SetLog[];

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const startWorkoutCopy = createStartWorkoutFlowCopy(t);
  const { colors, radius, spacing } = useZenliftTheme();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [allSets, setAllSets] = useState<AllSets>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionSets[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!id) {
        setErrorMessage(String(t('exercises.notFound')));
        setIsLoading(false);
        return;
      }

      try {
        const db = await getDatabase();
        if (!isActive) return;

        const exerciseRepo = new ExerciseRepo(db);
        const workoutRepo = new WorkoutRepo(db);

        const [exerciseData, muscleData, setRows, prData] = await Promise.all([
          exerciseRepo.getById(id),
          exerciseRepo.getMuscles(id),
          workoutRepo.getExerciseSetHistory(id),
          workoutRepo.getPRsByExercise(id),
        ]);

        if (!isActive) return;

        if (!exerciseData) {
          setErrorMessage(String(t('exercises.notFound')));
          setIsLoading(false);
          return;
        }

        const sessions = groupSetsBySession(setRows);
        const allFlatSets = setRows.map((row) => ({
          id: row.id,
          workout_exercise_id: row.workout_exercise_id,
          set_number: row.set_number,
          weight: row.weight,
          reps: row.reps,
          set_type: row.set_type,
          is_completed: row.is_completed,
          completed_at: row.completed_at,
          notes: row.notes,
        }));

        setExercise(exerciseData);
        setMuscles(muscleData);
        setAllSets(allFlatSets);
        setSessionHistory(sessions);
        setPrs(prData);
        } catch (loadError) {
          console.error('[ExerciseDetail] Failed to load:', loadError);
          if (isActive) {
          setErrorMessage(String(t('exercises.loadError')));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, [id, t]);

  const bestMetrics = getBestMetrics(allSets);
  const history = getSessionHistory(sessionHistory);
  const progressData = getProgressData(history, 'volume');

  const handleDelete = useCallback(() => {
    if (!exercise) return;

    Alert.alert(
      String(t('exercises.alerts.deleteTitle')),
      String(t('exercises.alerts.deleteBodyNamed', { name: exercise.name })),
      [
        { text: String(t('common.cancel')), style: 'cancel' },
        {
          text: String(t('common.delete')),
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              const exerciseRepo = new ExerciseRepo(db);
              await exerciseRepo.delete(id!);
              router.back();
            } catch {
              Alert.alert(String(t('common.error')), String(t('exercises.alerts.deleteFailed')));
            }
          },
        },
      ],
    );
  }, [exercise, id, router, t]);

  const handleEdit = useCallback(() => {
    router.push(`/exercise/edit/${id}` as never);
  }, [id, router]);

  const handleQuickWorkout = useCallback(() => {
    void startWorkoutFlow({ exerciseId: id }, startWorkoutCopy);
  }, [id, startWorkoutCopy]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </ThemedView>
    );
  }

  if (errorMessage || !exercise) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ThemedText type="subtitle" style={styles.errorTitle}>
            {errorMessage ?? t('exercises.notFound')}
          </ThemedText>
          <Pressable
            accessibilityLabel={String(t('common.back'))}
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.lg,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <ThemedText type="smallBold" style={{ color: colors.surface }}>
              {t('common.back')}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isCustom = exercise.is_custom === 1;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.three,
            paddingTop: spacing.three,
            paddingBottom: spacing.six + spacing.five,
          },
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.three }]}>
          <Pressable
            accessibilityLabel={String(t('common.back'))}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backRow,
              { opacity: pressed ? 0.72 : 1 },
            ]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={20}
              tintColor={colors.mutedText}
            />
            <ThemedText type="small" themeColor="mutedText">
              {t('exercises.library')}
            </ThemedText>
          </Pressable>

          <View style={styles.titleRow}>
            <ThemedText
              type="subtitle"
              style={[styles.exerciseName, { color: colors.text }]}>
              {exercise.name}
            </ThemedText>

            {isCustom ? (
              <View style={styles.actionButtons}>
                <Pressable
                  accessibilityLabel={String(t('exercises.edit'))}
                  accessibilityRole="button"
                  onPress={handleEdit}
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                      opacity: pressed ? 0.72 : 1,
                    },
                  ]}>
                  <SymbolView
                    name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                    size={18}
                    tintColor={colors.text}
                  />
                </Pressable>
                <Pressable
                  accessibilityLabel={String(t('exercises.delete'))}
                  accessibilityRole="button"
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                      opacity: pressed ? 0.72 : 1,
                    },
                  ]}>
                  <SymbolView
                    name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                    size={18}
                    tintColor={colors.danger}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceElevated, borderRadius: radius.pill }]}>
              <SymbolView
                name={equipmentIcons[exercise.equipment] as never}
                size={14}
                tintColor={colors.mutedText}
              />
              <ThemedText type="small" themeColor="mutedText" style={styles.metaPillText}>
                {t(`exercises.equipmentOptions.${exercise.equipment}`)}
              </ThemedText>
            </View>
            {exercise.category ? (
              <View style={[styles.metaPill, { backgroundColor: colors.surfaceElevated, borderRadius: radius.pill }]}>
                <ThemedText type="small" themeColor="mutedText" style={styles.metaPillText}>
                  {t(`exercises.categoryOptions.${exercise.category}`)}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {muscles.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.muscleRow, { gap: 8 }]}>
              {muscles.map((muscle) => {
                const name = muscle.name as MuscleGroupName;

                return (
                  <MuscleBadge
                    key={muscle.id}
                    accessibilityLabel={getMuscleDisplayName(muscle, i18n.language)}
                    isPrimary={name in muscleColors}
                    muscleName={name in muscleColors ? name : ('Full Body' as MuscleGroupName)}
                  />
                );
              })}
            </ScrollView>
          ) : null}
        </View>

        {/* Content sections */}
        <View style={{ gap: spacing.three }}>
          <BestPerformanceCard {...bestMetrics} />
          <RecentHistoryList sessions={history} />
          <ProgressChart data={progressData} />
          <ExercisePRList prs={prs} />
        </View>

        {/* Quick Workout */}
        <View style={[styles.quickWorkoutContainer, { marginTop: spacing.four }]}>
          <Pressable
            accessibilityLabel={String(t('exercises.quickStart'))}
            accessibilityRole="button"
            onPress={handleQuickWorkout}
            style={({ pressed }) => [
              styles.quickWorkoutButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.lg,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <SymbolView
              name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
              size={18}
              tintColor={colors.surface}
            />
            <ThemedText type="smallBold" style={{ color: colors.surface }}>
              {t('exercises.quickStart')}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    textAlign: 'center',
  },
  exerciseName: {
    flex: 1,
  },
  header: {
    gap: 0,
  },
  iconButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  metaPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaPillText: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  muscleRow: {
    paddingRight: 24,
  },
  quickWorkoutButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 24,
  },
  quickWorkoutContainer: {
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
});
