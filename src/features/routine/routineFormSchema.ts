import { z } from 'zod/v4';

export const routineGoalOptions = ['hipertrofia', 'fuerza', 'resistencia'] as const;

const optionalPositiveInt = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().min(1).optional(),
);

const optionalNonNegativeInt = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).optional(),
);

export const exerciseFormSchema = z.object({
  key: z.string().min(1),
  id: z.string().optional(),
  exerciseId: z.string().min(1, 'Selecciona un ejercicio'),
  exerciseName: z.string().min(1),
  targetSets: z.coerce.number().int().min(1, 'Mínimo 1 serie'),
  targetRepsMin: optionalPositiveInt,
  targetRepsMax: optionalPositiveInt,
  restSeconds: optionalNonNegativeInt,
});

export const dayFormSchema = z.object({
  key: z.string().min(1),
  id: z.string().optional(),
  name: z.string().trim().min(1, 'El día necesita un nombre'),
  exercises: z.array(exerciseFormSchema).min(1, 'Cada día necesita al menos 1 ejercicio'),
});

export const routineFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().default(''),
  goal: z.enum(routineGoalOptions).optional(),
  days: z.array(dayFormSchema).min(1, 'La rutina necesita al menos 1 día'),
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
