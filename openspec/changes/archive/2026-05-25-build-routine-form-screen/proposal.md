## Why

The core Zenlift loop starts with creating a routine. Without a routine form, users cannot define their workout templates (days, exercises, sets/reps/rest targets), which blocks the entire "Crear rutina → Iniciar workout → Registrar sets" flow. This is a P0 dependency that unblocks onboarding, home screen, and the active workout experience.

## What Changes

- New screen at `app/routine/create.tsx` for creating routines from scratch
- New screen at `app/routine/edit/[id].tsx` for editing existing routines (preserves UUIDs, does not mutate past sessions)
- Dynamic day editor component with add/remove/reorder capabilities
- Exercise picker component that searches and filters from the exercise library
- Exercise configurator modal for setting target sets, reps min/max, and rest seconds
- Zod-based form validation enforcing: name required, at least 1 day, at least 1 exercise per day, target sets >= 1
- Transactional save through RoutineRepo creating/updating routines, days, and exercises atomically
- Navigation from save to routine detail screen

## Capabilities

### New Capabilities

- `routine-form-screen`: Full create/edit form for routines with dynamic days and exercises, Zod validation, and transactional persistence via RoutineRepo

### Modified Capabilities

_None. This is a new screen built on top of existing repositories and entities._

## Impact

- New route files: `app/routine/create.tsx`, `app/routine/edit/[id].tsx`
- New UI components: `DayEditor`, `ExercisePicker`, `ExerciseConfigurator`
- Depends on: RoutineRepo (existing), ExerciseRepo (existing), domain entities (existing), theme tokens (existing)
- No database schema changes needed — uses existing routines, routine_days, routine_exercises tables
- No changes to existing specs or breaking changes to any API
