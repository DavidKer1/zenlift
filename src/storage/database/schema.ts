/**
 * Zenlift SQLite schema DDL
 *
 * Exports `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL` as idempotent SQL string
 * constants covering all 12 domain entity tables, their relationships, CHECK
 * constraints, and query-hotspot indices.
 *
 * @remarks All column names use snake_case matching the field names in
 * `src/domain/entities/index.ts` exactly.  All foreign keys cascade on delete.
 * Text primary keys are used for every entity table except `app_settings` and
 * `_migrations`.
 *
 * @see {@link import('@/domain/entities')} for the matching TypeScript interfaces
 */

import type {
  MuscleGroup,
  Exercise,
  ExerciseMuscle,
  Routine,
  RoutineDay,
  RoutineExercise,
  WorkoutSession,
  WorkoutExercise,
  SetLog,
  PersonalRecord,
  AppSettings,
  Migration,
} from '@/domain/entities';

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const CREATE_TABLES_SQL = `
-- Reference / lookup tables ------------------------------------------------

CREATE TABLE IF NOT EXISTS muscle_groups (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  display_name_es  TEXT NOT NULL,
  color            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  equipment    TEXT NOT NULL,
  category     TEXT NOT NULL,
  is_custom    INTEGER NOT NULL DEFAULT 0,
  is_favorite  INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TEXT,
  updated_at   TEXT
);

-- Junction tables ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS exercise_muscles (
  id              TEXT PRIMARY KEY,
  exercise_id     TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id TEXT NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK(role IN ('primary','secondary'))
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id             TEXT PRIMARY KEY,
  routine_day_id TEXT NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id    TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  target_sets    INTEGER,
  target_reps_min INTEGER,
  target_reps_max INTEGER,
  notes          TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

-- Routine scaffolding ------------------------------------------------------

CREATE TABLE IF NOT EXISTS routines (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  goal         TEXT,
  is_archived  INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT,
  updated_at   TEXT
);

CREATE TABLE IF NOT EXISTS routine_days (
  id           TEXT PRIMARY KEY,
  routine_id   TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  day_of_week  INTEGER,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- Workout session tables ---------------------------------------------------

CREATE TABLE IF NOT EXISTS workout_sessions (
  id               TEXT PRIMARY KEY,
  routine_id       TEXT REFERENCES routines(id) ON DELETE CASCADE,
  routine_day_id   TEXT REFERENCES routine_days(id) ON DELETE CASCADE,
  name             TEXT,
  started_at       TEXT NOT NULL,
  ended_at         TEXT,
  duration_seconds INTEGER,
  status           TEXT NOT NULL CHECK(status IN ('active','completed','cancelled')),
  notes            TEXT,
  created_at       TEXT,
  updated_at       TEXT
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id                 TEXT PRIMARY KEY,
  workout_session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id        TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  notes              TEXT
);

-- Workout data tables ------------------------------------------------------

CREATE TABLE IF NOT EXISTS set_logs (
  id                  TEXT PRIMARY KEY,
  workout_exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number          INTEGER NOT NULL,
  weight              REAL NOT NULL,
  reps                INTEGER NOT NULL,
  set_type            TEXT NOT NULL CHECK(set_type IN ('normal','warmup','drop','failure','amrap')) DEFAULT 'normal',
  is_completed        INTEGER NOT NULL DEFAULT 0,
  completed_at        TEXT,
  notes               TEXT
);

CREATE TABLE IF NOT EXISTS personal_records (
  id                  TEXT PRIMARY KEY,
  exercise_id         TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  workout_session_id  TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  type                TEXT NOT NULL CHECK(type IN ('max_weight','max_volume','max_reps','estimated_1rm','max_session_volume')),
  value               REAL NOT NULL,
  weight              REAL,
  reps                INTEGER,
  achieved_at         TEXT NOT NULL
);

-- Meta tables --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS app_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS _migrations (
  version      INTEGER PRIMARY KEY,
  description  TEXT,
  applied_at   TEXT NOT NULL
);
`;

// ---------------------------------------------------------------------------
// Indices
// ---------------------------------------------------------------------------

export const CREATE_INDICES_SQL = `
CREATE INDEX IF NOT EXISTS idx_exercise_muscles_exercise
  ON exercise_muscles(exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_muscles_muscle
  ON exercise_muscles(muscle_group_id);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_status
  ON workout_sessions(status);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_started
  ON workout_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_session
  ON workout_exercises(workout_session_id);

CREATE INDEX IF NOT EXISTS idx_set_logs_workout_exercise
  ON set_logs(workout_exercise_id);
`;

// ---------------------------------------------------------------------------
// Domain-type re-export (for documentation / type-safety tracking)
// ---------------------------------------------------------------------------

export type SchemaEntityTypes = {
  MuscleGroup: MuscleGroup;
  Exercise: Exercise;
  ExerciseMuscle: ExerciseMuscle;
  Routine: Routine;
  RoutineDay: RoutineDay;
  RoutineExercise: RoutineExercise;
  WorkoutSession: WorkoutSession;
  WorkoutExercise: WorkoutExercise;
  SetLog: SetLog;
  PersonalRecord: PersonalRecord;
  AppSettings: AppSettings;
  Migration: Migration;
};
