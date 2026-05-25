import type { DetectedPR } from '@/domain/services/prDetection';

export type MuscleRole = 'primary' | 'secondary';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'smith_machine'
  | 'ez_bar'
  | 'cardio_machine'
  | 'other';

export type ExerciseCategory = 'strength' | 'cardio' | 'mobility' | 'core';

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure' | 'amrap';

export type WorkoutStatus = 'active' | 'completed' | 'cancelled';

export type PersonalRecordType =
  | 'max_weight'
  | 'max_volume'
  | 'max_reps'
  | 'estimated_1rm'
  | 'max_session_volume';

export type SQLiteBoolean = 0 | 1;

export interface MuscleGroup {
  id: string;
  name: string;
  display_name_es: string;
  color: string;
}

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  category: ExerciseCategory;
  is_custom: SQLiteBoolean;
  is_favorite: SQLiteBoolean;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExerciseMuscle {
  id: string;
  exercise_id: string;
  muscle_group_id: string;
  role: MuscleRole;
}

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  is_archived: SQLiteBoolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  name: string;
  day_of_week: number | null;
  sort_order: number;
}

export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number | null;
  notes: string | null;
  sort_order: number;
}

export interface WorkoutSession {
  id: string;
  routine_id: string | null;
  routine_day_id: string | null;
  name: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: WorkoutStatus;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkoutExercise {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  sort_order: number;
  notes: string | null;
}

export interface SetLog {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  set_type: SetType;
  is_completed: SQLiteBoolean;
  completed_at: string | null;
  notes: string | null;
}

export interface PersonalRecord {
  id: string;
  exercise_id: string;
  workout_session_id: string;
  type: PersonalRecordType;
  value: number;
  weight: number | null;
  reps: number | null;
  achieved_at: string;
}

export interface AppSettings {
  key: string;
  value: string;
}

export interface Migration {
  version: number;
  description: string | null;
  applied_at: string;
}

export interface ExerciseWithMuscles extends Exercise {
  muscles: Array<ExerciseMuscle & { muscle_group: MuscleGroup }>;
}

export interface RoutineExerciseWithExercise extends RoutineExercise {
  exercise: Exercise;
}

export interface FullRoutineDay extends RoutineDay {
  exercises: RoutineExerciseWithExercise[];
}

export interface FullRoutine extends Routine {
  days: FullRoutineDay[];
}

export interface WorkoutExerciseWithSets extends WorkoutExercise {
  exercise: Exercise;
  sets: SetLog[];
}

export interface FullWorkoutSession extends WorkoutSession {
  routine: Routine | null;
  routine_day: RoutineDay | null;
  exercises: WorkoutExerciseWithSets[];
  personal_records: PersonalRecord[];
}

export type FullSession = FullWorkoutSession;

export interface WorkoutSummary {
  session_id: string;
  routine_id: string | null;
  routine_day_id: string | null;
  name: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  status: WorkoutStatus;
  exercise_count: number;
  completed_set_count: number;
  total_volume: number;
  personal_record_count: number;
  prs: DetectedPR[];
}
