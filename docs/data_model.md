# Zenlift Data Model

## Principios

- Todos los IDs son UUIDs de texto desde el día 1.
- No usar enteros autoincrementales.
- La app es offline-first: los IDs se generan en el dispositivo.
- Editar rutinas no modifica sesiones pasadas.
- El historial es conceptualmente inmutable, pero editable por el usuario.
- Si una sesión pasada cambia, las estadísticas se recalculan.

## Implementación actual

La implementación usa Drift/SQLite como almacenamiento estructurado local:

- Tablas en snake_case con IDs de texto y foreign keys con cascade donde aplica.
- Repositorios por feature en `features/<feature>/data`, contratos en `features/<feature>/domain`.
- `app_settings` se incluye junto al backup `.zenlift`; las preferencias activas también se espejan desde shared_preferences para que backup/import/delete sean consistentes.
- `_migrations` registra migraciones de schema SQLite aplicadas.

## Entidades principales

| Entidad | Rol |
|---|---|
| MuscleGroup | Grupo muscular seed. |
| Exercise | Ejercicio seed o personalizado. |
| ExerciseMuscle | Relación many-to-many exercise/muscle con role. |
| Routine | Plantilla de entrenamiento. |
| RoutineDay | Día o bloque dentro de una rutina. |
| RoutineExercise | Ejercicio configurado dentro de un día. |
| WorkoutSession | Entrenamiento realizado o activo. |
| WorkoutExercise | Ejercicio ejecutado dentro de una sesión. |
| SetLog | Serie individual registrada. |
| PersonalRecord | Record detectado por ejercicio/sesión. |
| AppSettings | Preferencias persistidas. |
| Migration | Control de migraciones SQLite. |

## Relaciones

```text
MuscleGroup <-> ExerciseMuscle <-> Exercise

Routine
  -> RoutineDay[]
    -> RoutineExercise[]
      -> Exercise

WorkoutSession
  -> WorkoutExercise[]
    -> SetLog[]

Exercise
  -> PersonalRecord[]
```

## Tablas

### muscle_groups

Seed fijo, no editable por el usuario.

| Campo | Tipo |
|---|---|
| id | text PK |
| name | text UNIQUE |
| displayNameEs | text |
| color | text |

Seed inicial: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Abs, Quads, Hamstrings, Glutes, Calves, Full Body, Cardio.

### exercise_muscles

| Campo | Tipo |
|---|---|
| id | text PK |
| exerciseId | text FK |
| muscleGroupId | text FK |
| role | text: `primary` o `secondary` |

Regla: un ejercicio tiene exactamente un `primary` y cero o más `secondary`. Validar en repositorio/dominio.

### exercises

| Campo | Tipo |
|---|---|
| id | text PK |
| name | text NOT NULL |
| equipment | text NOT NULL |
| category | text NOT NULL |
| isCustom | integer DEFAULT 0 |
| isFavorite | integer DEFAULT 0 |
| notes | text |
| createdAt | text |
| updatedAt | text |

No guardar `primaryMuscle` ni `secondaryMuscles` como columnas; usar `exercise_muscles`.

### routines

| Campo | Tipo |
|---|---|
| id | text PK |
| name | text NOT NULL |
| description | text |
| goal | text |
| isArchived | integer DEFAULT 0 |
| sortOrder | integer DEFAULT 0 |
| createdAt | text |
| updatedAt | text |

### routine_days

| Campo | Tipo |
|---|---|
| id | text PK |
| routineId | text FK NOT NULL ON DELETE CASCADE |
| name | text NOT NULL |
| dayOfWeek | integer nullable |
| sortOrder | integer DEFAULT 0 |

### routine_exercises

| Campo | Tipo |
|---|---|
| id | text PK |
| routineDayId | text FK NOT NULL ON DELETE CASCADE |
| exerciseId | text FK NOT NULL |
| targetSets | integer |
| targetRepsMin | integer |
| targetRepsMax | integer |
| notes | text |
| sortOrder | integer DEFAULT 0 |

### workout_sessions

| Campo | Tipo |
|---|---|
| id | text PK |
| routineId | text nullable |
| routineDayId | text nullable |
| name | text |
| startedAt | text NOT NULL |
| endedAt | text nullable |
| durationSeconds | integer |
| status | text: `active`, `completed`, `cancelled` |
| notes | text |
| createdAt | text |
| updatedAt | text |

### workout_exercises

| Campo | Tipo |
|---|---|
| id | text PK |
| workoutSessionId | text FK NOT NULL ON DELETE CASCADE |
| exerciseId | text FK NOT NULL |
| sortOrder | integer DEFAULT 0 |
| notes | text |

### set_logs

| Campo | Tipo |
|---|---|
| id | text PK |
| workoutExerciseId | text FK NOT NULL ON DELETE CASCADE |
| setNumber | integer NOT NULL |
| weight | real NOT NULL |
| reps | integer NOT NULL |
| setType | text DEFAULT `normal` |
| isCompleted | integer DEFAULT 0 |
| completedAt | text nullable |
| notes | text |

Set types: `normal`, `warmup`, `drop`, `failure`, `amrap`.

### personal_records

| Campo | Tipo |
|---|---|
| id | text PK |
| exerciseId | text FK NOT NULL |
| workoutSessionId | text FK NOT NULL |
| type | text NOT NULL |
| value | real NOT NULL |
| weight | real nullable |
| reps | integer nullable |
| achievedAt | text NOT NULL |

PR types: `max_weight`, `max_volume`, `max_reps`, `estimated_1rm`, `max_session_volume`.

### app_settings

Key-value para preferencias estructuradas. Settings de alta frecuencia y helpers ligeros de recuperación van en shared_preferences.

| Campo | Tipo |
|---|---|
| key | text PK |
| value | text |

### _migrations

| Campo | Tipo |
|---|---|
| version | integer PK |
| description | text |
| appliedAt | text NOT NULL |

## Índices mínimos

```sql
CREATE INDEX idx_exercise_muscles_exercise ON exercise_muscles(exerciseId);
CREATE INDEX idx_exercise_muscles_muscle ON exercise_muscles(muscleGroupId);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_workout_sessions_started ON workout_sessions(startedAt);
CREATE INDEX idx_workout_exercises_session ON workout_exercises(workoutSessionId);
CREATE INDEX idx_set_logs_workout_exercise ON set_logs(workoutExerciseId);
```

## Métricas calculadas

Volumen:

```text
volume = weight * reps
sessionVolume = sum(all completed set volumes)
```

Estimated 1RM Epley:

```text
estimated1RM = weight * (1 + reps / 30)
```

Consistencia semanal:

```text
weeklyConsistency = workoutsCompletedThisWeek / targetWorkoutsPerWeek
```
