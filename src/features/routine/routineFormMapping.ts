import type { FullRoutine } from '@/domain/entities';
import { generateId } from '@/utils/id';

import type { DayFormValues, ExerciseFormValues, RoutineFormValues } from './routineFormSchema';

export function createDefaultDay(dayNumber: number, name = `Day ${dayNumber}`): DayFormValues {
  return {
    key: generateId(),
    name,
    exercises: [],
  };
}

export function createExerciseFormValues(input: {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}): ExerciseFormValues {
  return {
    key: generateId(),
    exerciseId: input.exerciseId,
    exerciseName: input.exerciseName,
    targetSets: input.targetSets,
    targetRepsMin: input.targetRepsMin,
    targetRepsMax: input.targetRepsMax,
  };
}

export function mapFullRoutineToFormValues(routine: FullRoutine): RoutineFormValues {
  return {
    name: routine.name,
    description: routine.description ?? '',
    goal: normalizeGoal(routine.goal),
    days: routine.days.map((day) => ({
      key: day.id,
      id: day.id,
      name: day.name,
      exercises: day.exercises.map((exercise) => ({
        key: exercise.id,
        id: exercise.id,
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise.name,
        targetSets: exercise.target_sets ?? 1,
        targetRepsMin: exercise.target_reps_min ?? undefined,
        targetRepsMax: exercise.target_reps_max ?? undefined,
      })),
    })),
  };
}

function normalizeGoal(goal: string | null): RoutineFormValues['goal'] {
  if (goal === 'hipertrofia' || goal === 'fuerza' || goal === 'resistencia') {
    return goal;
  }

  return undefined;
}
