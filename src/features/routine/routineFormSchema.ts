import { z } from 'zod/v4';

export const routineGoalOptions = ['hipertrofia', 'fuerza', 'resistencia'] as const;

const optionalPositiveInt = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().min(1).optional(),
);

export const exerciseFormSchema = z.object({
  key: z.string().min(1),
  id: z.string().optional(),
  exerciseId: z.string().min(1, 'routines.validation.selectExercise'),
  exerciseName: z.string().min(1),
  targetSets: z.coerce.number().int().min(1, 'routines.validation.minSets'),
  targetRepsMin: optionalPositiveInt,
  targetRepsMax: optionalPositiveInt,
});

export const dayFormSchema = z.object({
  key: z.string().min(1),
  id: z.string().optional(),
  name: z.string().trim().min(1, 'routines.validation.dayNeedsName'),
  exercises: z.array(exerciseFormSchema).min(1, 'routines.validation.dayNeedsExercise'),
});

export const routineFormSchema = z.object({
  name: z.string().trim().min(1, 'routines.validation.nameRequired'),
  description: z.string().optional().default(''),
  goal: z.enum(routineGoalOptions).optional(),
  days: z.array(dayFormSchema).min(1, 'routines.validation.minDays'),
});

export type RoutineFormValues = z.infer<typeof routineFormSchema>;
export type DayFormValues = z.infer<typeof dayFormSchema>;
export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

export function createEmptyRoutineFormValues(): RoutineFormValues {
  return {
    name: '',
    description: '',
    goal: undefined,
    days: [],
  };
}
