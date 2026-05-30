import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { DaySection } from '@/components/routine/DaySection';
import { RoutineHeader } from '@/components/routine/RoutineHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { FullRoutine } from '@/domain/entities';
import { muscleColors, type MuscleGroupName } from '@/theme/muscleColors';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';

type MuscleColorRow = {
  exercise_id: string;
  display_name_es: string;
};

async function resolvePrimaryMuscleColors(
  exerciseIds: string[],
): Promise<Map<string, string | null>> {
  const colorMap = new Map<string, string | null>();

  if (exerciseIds.length === 0) return colorMap;

  for (const id of exerciseIds) {
    colorMap.set(id, null);
  }

  try {
    const db = await getDatabase();

    const placeholders = exerciseIds.map(() => '?').join(',');
    const rows = await db.getAllAsync<MuscleColorRow>(
      `SELECT em.exercise_id, mg.display_name_es
       FROM exercise_muscles em
       JOIN muscle_groups mg ON em.muscle_group_id = mg.id
       WHERE em.role = 'primary' AND em.exercise_id IN (${placeholders})`,
      ...exerciseIds,
    );

    for (const row of rows) {
      const color = muscleColors[row.display_name_es as MuscleGroupName] ?? null;
      colorMap.set(row.exercise_id, color);
    }
  } catch (error) {
    console.error('[RoutineDetail] Failed to resolve muscle colors:', error);
  }

  return colorMap;
}

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors, radius, spacing } = useZenliftTheme();

  const [routine, setRoutine] = useState<FullRoutine | null>(null);
  const [muscleColorMap, setMuscleColorMap] = useState<Map<string, string | null>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const db = await getDatabase();
      const repo = new RoutineRepo(db);
      const fullRoutine = await repo.getFullRoutine(id);

      if (fullRoutine) {
        const exerciseIds = fullRoutine.days.flatMap((day) =>
          day.exercises.map((ex) => ex.exercise_id),
        );
        const colorMap = await resolvePrimaryMuscleColors(exerciseIds);
        setMuscleColorMap(colorMap);
      }

      setRoutine(fullRoutine);
    } catch (error) {
      console.error('[RoutineDetail] Failed to load routine:', error);
      setRoutine(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!id) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.centered}>
          <ThemedText themeColor="mutedText">{t('routines.invalidId')}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <ThemedText themeColor="mutedText" style={styles.loadingText}>
            {t('routines.loading')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.centered}>
          <ThemedText type="subtitle" style={styles.errorTitle}>
            {t('routines.notFound')}
          </ThemedText>
          <ThemedText themeColor="mutedText" style={styles.errorText}>
            {t('routines.notFoundBody')}
          </ThemedText>
          <View
            style={[
              styles.backToRoutinesButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                marginTop: spacing.three,
                paddingHorizontal: 20,
              },
            ]}>
            <ThemedText
              type="smallBold"
              onPress={() => router.replace('/routines')}
              style={[styles.buttonText, { color: colors.surface }]}>
              {t('routines.backToRoutines')}
            </ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              padding: spacing.four,
              paddingBottom: spacing.six,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <RoutineHeader routine={routine} onBack={handleBack} onRefresh={loadData} />

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.three }]} />

          {routine.days.length === 0 ? (
            <ThemedView
              type="surface"
              style={[
                styles.emptyRoutine,
                {
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.three,
                },
              ]}>
              <ThemedText themeColor="mutedText" style={styles.emptyText}>
                {t('routines.emptyRoutineBody')}
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.daysContainer}>
              {routine.days.map((day) => (
                <DaySection
                  key={day.id}
                  day={day}
                  muscleColorMap={muscleColorMap}
                  onRefresh={loadData}
                  routineId={routine.id}
                  routineName={routine.name}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backToRoutinesButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  buttonText: {
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexGrow: 1,
  },
  daysContainer: {
    gap: 24,
  },
  divider: {
    height: 1,
  },
  emptyRoutine: {
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    lineHeight: 32,
  },
  loadingText: {
    marginTop: 8,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
