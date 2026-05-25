import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { FullRoutineDay } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';

type StartWorkoutButtonProps = {
  day: FullRoutineDay;
  routineId: string;
  routineName: string;
};

export function StartWorkoutButton({
  day,
  routineId,
  routineName,
}: StartWorkoutButtonProps) {
  const router = useRouter();
  const { colors, radius, spacing, typography } = useZenliftTheme();

  const handlePress = useCallback(async () => {
    try {
      const db = await getDatabase();
      const workoutRepo = new WorkoutRepo(db);

      const activeSession = await workoutRepo.getActiveSession();

      if (activeSession) {
        Alert.alert(
          'Sesion activa',
          'Ya tienes una sesion de workout activa. ¿Quieres iniciar una nueva? La sesion activa se cancelara.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Nueva sesion',
              onPress: async () => {
                await workoutRepo.cancelSession(activeSession.id);
                await createAndNavigate(workoutRepo, router, day, routineId, routineName);
              },
            },
          ],
        );
        return;
      }

      await createAndNavigate(workoutRepo, router, day, routineId, routineName);
    } catch (error) {
      console.error('[StartWorkoutButton] Failed:', error);
      Alert.alert('Error', 'No se pudo iniciar la sesion de workout.');
    }
  }, [day, routineId, routineName, router]);

  return (
    <Pressable
      accessibilityLabel={`Iniciar workout para ${day.name}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.lg,
          minHeight: 56,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: spacing.three,
        },
      ]}>
      <ThemedText style={[styles.label, { color: colors.surface, fontSize: typography.size.md }]}>
        Iniciar Workout
      </ThemedText>
    </Pressable>
  );
}

async function createAndNavigate(
  workoutRepo: WorkoutRepo,
  router: ReturnType<typeof useRouter>,
  day: FullRoutineDay,
  routineId: string,
  routineName: string,
) {
  const session = await workoutRepo.createSession({
    name: `${routineName} - ${day.name}`,
    routineId,
    routineDayId: day.id,
  });

  for (const exercise of day.exercises) {
    await workoutRepo.addExercise(session.id, exercise.exercise.id);
  }

  router.push(`/workout/${session.id}` as never);
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontWeight: '700',
  },
});
