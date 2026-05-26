import type { SQLiteDatabase } from 'expo-sqlite';

import { generateId } from '@/utils/id';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';

import type { RoutineFormValues } from './routineFormSchema';

export async function createRoutineFromForm(
  db: SQLiteDatabase,
  values: RoutineFormValues,
): Promise<string> {
  let routineId = '';

  await db.withTransactionAsync(async () => {
    const routineRepo = new RoutineRepo(db);
    const routine = await routineRepo.create({
      name: values.name.trim(),
      description: normalizeOptionalText(values.description),
      goal: values.goal ?? null,
    });

    routineId = routine.id;
    await insertRoutineChildren(db, routineId, values);
  });

  return routineId;
}

export async function updateRoutineFromForm(
  db: SQLiteDatabase,
  routineId: string,
  values: RoutineFormValues,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const routineRepo = new RoutineRepo(db);
    await routineRepo.update(routineId, {
      name: values.name.trim(),
      description: normalizeOptionalText(values.description),
      goal: values.goal ?? null,
    });

    const incomingDayIds = values.days.map((day) => day.id).filter(Boolean) as string[];
    const existingDays = await db.getAllAsync<{ id: string }>(
      'SELECT id FROM routine_days WHERE routine_id = ?',
      routineId,
    );
    const removedDayIds = existingDays
      .map((day) => day.id)
      .filter((dayId) => !incomingDayIds.includes(dayId));

    for (const dayId of removedDayIds) {
      await db.runAsync(
        'UPDATE workout_sessions SET routine_day_id = NULL WHERE routine_day_id = ?',
        dayId,
      );
      await db.runAsync('DELETE FROM routine_days WHERE id = ? AND routine_id = ?', dayId, routineId);
    }

    for (let dayIndex = 0; dayIndex < values.days.length; dayIndex += 1) {
      const day = values.days[dayIndex];
      const dayId = day.id ?? generateId();

      if (day.id) {
        await db.runAsync(
          'UPDATE routine_days SET name = ?, sort_order = ? WHERE id = ? AND routine_id = ?',
          day.name.trim(),
          dayIndex,
          day.id,
          routineId,
        );
      } else {
        await db.runAsync(
          `INSERT INTO routine_days (id, routine_id, name, day_of_week, sort_order)
           VALUES (?, ?, ?, NULL, ?)`,
          dayId,
          routineId,
          day.name.trim(),
          dayIndex,
        );
      }

      const incomingExerciseIds = day.exercises
        .map((exercise) => exercise.id)
        .filter(Boolean) as string[];
      const existingExercises = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM routine_exercises WHERE routine_day_id = ?',
        dayId,
      );
      const removedExerciseIds = existingExercises
        .map((exercise) => exercise.id)
        .filter((exerciseId) => !incomingExerciseIds.includes(exerciseId));

      for (const exerciseId of removedExerciseIds) {
        await db.runAsync('DELETE FROM routine_exercises WHERE id = ?', exerciseId);
      }

      for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex += 1) {
        const exercise = day.exercises[exerciseIndex];

        if (exercise.id) {
          await db.runAsync(
            `UPDATE routine_exercises
             SET exercise_id = ?, target_sets = ?, target_reps_min = ?, target_reps_max = ?,
                 sort_order = ?
             WHERE id = ? AND routine_day_id = ?`,
            exercise.exerciseId,
            exercise.targetSets,
            exercise.targetRepsMin ?? null,
            exercise.targetRepsMax ?? null,
            exerciseIndex,
            exercise.id,
            dayId,
          );
        } else {
          await insertRoutineExercise(db, dayId, exercise, exerciseIndex);
        }
      }
    }
  });
}

async function insertRoutineChildren(
  db: SQLiteDatabase,
  routineId: string,
  values: RoutineFormValues,
): Promise<void> {
  for (let dayIndex = 0; dayIndex < values.days.length; dayIndex += 1) {
    const day = values.days[dayIndex];
    const dayId = day.id ?? generateId();

    await db.runAsync(
      `INSERT INTO routine_days (id, routine_id, name, day_of_week, sort_order)
       VALUES (?, ?, ?, NULL, ?)`,
      dayId,
      routineId,
      day.name.trim(),
      dayIndex,
    );

    for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex += 1) {
      await insertRoutineExercise(db, dayId, day.exercises[exerciseIndex], exerciseIndex);
    }
  }
}

async function insertRoutineExercise(
  db: SQLiteDatabase,
  dayId: string,
  exercise: RoutineFormValues['days'][number]['exercises'][number],
  sortOrder: number,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO routine_exercises
      (id, routine_day_id, exercise_id, target_sets, target_reps_min, target_reps_max, notes, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
    exercise.id ?? generateId(),
    dayId,
    exercise.exerciseId,
    exercise.targetSets,
    exercise.targetRepsMin ?? null,
    exercise.targetRepsMax ?? null,
    sortOrder,
  );
}

function normalizeOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}
