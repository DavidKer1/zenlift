## Why

La pantalla de Active Workout es LA pantalla crítica de Zenlift — es donde los usuarios registran sets durante su sesión de gimnasio. El core loop del producto depende completamente de que esta pantalla sea rápida, fiable y sin fricción. Sin ella, los usuarios no pueden registrar entrenamientos, seguir su progreso ni detectar PRs. Es una pantalla P0 que completa el flujo "iniciar workout → registrar sets → finalizar sesión".

## What Changes

- Nueva ruta `src/app/workout/active.tsx` — la pantalla Active Workout
- `WorkoutHeader` — header fijo con nombre de rutina/día, timer de duración (MM:SS), botón de cancelar con confirmación
- `WorkoutExerciseCard` — card colapsable por ejercicio mostrando nombre, dots de grupo muscular, target sets/reps de la rutina, datos de rendimiento anterior, lista de SetRows, y botón "Add Set"
- `SetRow` — EL componente crítico: input de peso con botones +/-, input de reps con botones +/-, botón check/done con haptic feedback, valores previos precargados, <3s para registrar un set
- `RestTimer` — placeholder del timer de descanso inline (se construye completo en tarea separada)
- `BottomBar` — barra inferior fija con "Add Exercise" y "Finish Workout"
- Integración con `ActiveWorkoutStore` (asumido construido en tarea 27) vía Zustand para estado global
- FlashList con `estimatedItemSize` para scroll 60fps
- Auto-scroll al ejercicio actual al completar un set
- Recuperación de sesión activa al montar vía `recoverSession()`
- Persistencia asíncrona de sets a SQLite en cada completación (<100ms)

## Capabilities

### New Capabilities
- `active-workout-screen`: La pantalla principal de workout en progreso. Gestiona la capa de display e interacción para registrar sets durante una sesión de gimnasio. Depende de ActiveWorkoutStore (Zustand), WorkoutRepo (persistencia SQLite), y Settings (MMKV para preferencia de unidad). Componentes: WorkoutHeader (timer, cancel), WorkoutExerciseCard (bloques colapsables de ejercicio con SetRows), SetRow (inputs de peso/reps con steppers +/- y haptic al completar), RestTimer (placeholder), BottomBar (añadir ejercicio, finalizar workout). Requisitos de rendimiento: scroll 60fps vía FlashList, registro de set en <3s, persistencia SQLite <100ms, React.memo en SetRow y WorkoutExerciseCard.

### Modified Capabilities
*(ninguno — no se modifican specs existentes)*

## Impact

- Nuevos archivos: `src/app/workout/active.tsx`, `src/components/workout/WorkoutHeader.tsx`, `src/components/workout/WorkoutExerciseCard.tsx`, `src/components/workout/SetRow.tsx`, `src/components/workout/RestTimer.tsx`, `src/components/workout/BottomBar.tsx`
- Depende de (asumidos construidos): `src/features/workout/stores/activeWorkoutStore.ts` (Task 27), flujo Start Workout (Task 28)
- Usa existentes: `WorkoutRepo` (CRUD de sets, operaciones de ejercicio, queries de rendimiento anterior), `useSettings()` (unidad de peso kg/lb), `ThemeProvider` (colors, spacing), `getIncrement()` de `utils/units`, `ExercisePicker` (para añadir ejercicios)
- Usa paquetes: `expo-haptics` (feedback al completar set), `@shopify/flash-list` (scroll 60fps), `zustand` (state management)
- Sin cambios en rutas, repositorios ni entidades existentes
