## Context

La pantalla Active Workout es el corazón de Zenlift. Debe funcionar a 60fps en Android gama media-baja, registrar sets en <3s y nunca perder datos. La arquitectura actual provee: `WorkoutRepo` con operaciones completas de sesión/ejercicio/sets (CRUD, `getLastWorkoutExerciseData`, `getPreviousPerformance`), `useSettings()` para preferencia kg/lb desde MMKV, y `ThemeProvider` con tokens de diseño. El `ExercisePicker` ya existe como modal reutilizable.

El `ActiveWorkoutStore` (Zustand) y el flujo Start Workout están asumidos como construidos en tareas previas (27 y 28). La Store expone: `session` (FullWorkoutSession), `exercises` (WorkoutExerciseWithSets[]), `elapsedSeconds`, `isActive`, `addExercise(sessionId, exerciseId)`, `addSet(workoutExerciseId, data)`, `completeSet(id)`, `updateSet(id, data)`, `cancelWorkout()`, `finishWorkout()`, `recoverSession()`.

El diseño sigue las referencias de `DESIGN.md`, pero el color primario es naranja atlético `#F97316` (no azul), y verde `#22C55E` solo para estados completados/éxito.

## Goals / Non-Goals

**Goals:**
- Pantalla de workout activo con header fijo (nombre rutina/día, timer MM:SS, cancelar), lista de ejercicios colapsables con SetRows, placeholder de RestTimer, y barra inferior (añadir ejercicio, finalizar)
- SetRow permite registrar peso/reps en <3s con inputs numéricos, steppers +/- (incremento 2.5kg/5lb según settings), valores previos precargados, y check con haptic feedback
- FlashList con `estimatedItemSize` para scroll 60fps con múltiples ejercicios y sets
- Persistencia asíncrona inmediata de sets completados a SQLite vía `WorkoutRepo`
- Recuperación de sesión activa al montar vía `recoverSession()` del store
- Auto-scroll al ejercicio actual al completar un set
- React.memo en SetRow y WorkoutExerciseCard, useCallback para handlers

**Non-Goals:**
- Timer de descanso funcional (placeholder — se construye en tarea separada "implement-rest-timer")
- Edición inline de ejercicios existentes en la rutina
- Swipe-to-delete sets
- Drag-to-reorder ejercicios
- Animaciones complejas
- Soporte offline con cola MMKV (MVP: asumimos SQLite disponible; la cola es mejora futura)

## Decisions

1. **ActiveWorkoutStore interface (asumida)**: La store de Zustand contiene el estado completo del workout activo. La pantalla lee `exercises`, `session`, `elapsedSeconds` desde el store y despacha acciones (`addSet`, `completeSet`, `updateSet`, `addExercise`, `cancelWorkout`, `finishWorkout`, `recoverSession`). La store internamente persiste a SQLite vía `WorkoutRepo`. Esto mantiene la pantalla fina (solo UI) y el estado en una capa reutilizable.

2. **WorkoutExerciseCard como variante del ExerciseCard existente**: Se crea `WorkoutExerciseCard` como un componente nuevo en `src/components/workout/`, no se modifica el `ExerciseCard` de la biblioteca. El workout variant añade: colapso/expansión, lista de SetRows, botón "Add Set", target sets/reps de `RoutineExercise`, y rendimiento anterior. Comparte el patrón de diseño (muscle dot, nombre, equipo) pero tiene estructura distinta.

3. **SetRow — inputs numéricos con steppers**: En lugar de sliders o pickers, usamos `TextInput` con `keyboardType="numeric"` + botones +/- a los lados. Esto permite entrada rápida por teclado numérico Y ajuste fino con botones sin teclear. Altura mínima de fila 56px, touch targets 48px. El botón check dispara `completeSet` en el store + haptic feedback.

4. **Precarga de valores anteriores**: Al montar un SetRow, se precarga el peso y reps con los últimos valores usados para ese ejercicio (`WorkoutRepo.getLastWorkoutExerciseData()`). Si no hay historial, se usa el target de la rutina (`RoutineExercise.target_reps_min`). Los steppers +/- usan `getIncrement(unit)` de `utils/units`.

5. **Colapso de ExerciseCard**: Solo un ejercicio expandido a la vez para mantener el scroll manejable. Al completar un set en el ejercicio actual, el siguiente ejercicio se expande automáticamente. Implementado con estado local `expandedExerciseId`.

6. **Timer de duración**: El `WorkoutHeader` muestra `elapsedSeconds` desde el store en formato MM:SS. El store actualiza este valor cada segundo vía `setInterval`. La UI solo refleja el estado; el cálculo real de duración ocurre en el store usando `started_at` del session.

7. **Cancelar con confirmación**: El botón cancelar muestra un `Alert.alert` nativo con "¿Cancelar workout?" y opciones "Seguir entrenando" / "Cancelar". Cancelar llama a `cancelWorkout()` en el store. No se eliminan datos; la sesión queda con status `'cancelled'`.

8. **RestTimer placeholder**: Un componente `RestTimer` mínimo que muestra "Descanso: --:--" o se oculta cuando no hay timer activo. La implementación completa (countdown con timestamps absolutos, MMKV persistence, haptics al llegar a cero) es la tarea "implement-rest-timer". Aquí solo se integra el punto de montaje.

9. **FlashList y rendimiento**: Usamos `FlashList` con `estimatedItemSize` calculado como altura base de card colapsada + sets expandidos. `React.memo` en `SetRow` (comparando `id`, `weight`, `reps`, `is_completed`) y `WorkoutExerciseCard` (comparando `exercise.id`, `sets.length`, estado expandido). `useCallback` para todos los handlers de set para evitar re-renders de hijos.

10. **Ejercicio "Add Exercise"**: Abre el `ExercisePicker` existente como modal. Al seleccionar, llama a `addExercise(session.id, exercise.id)` en el store. El store persiste vía `WorkoutRepo.addExercise()`.

## Risks / Trade-offs

- **Dependencia en stores no construidos**: ActiveWorkoutStore (task 27) y StartWorkout flow (task 28) DEBEN estar completos antes de esta tarea. → Mitigación: documentar la interfaz esperada en tasks.md y hacer el build asumiendo que cumplen el contrato. Si las interfaces cambian, ajustar.

- **Colapso/expansión puede causar saltos de scroll**: Expandir una card añade SetRows que cambian la altura. → Mitigación: usar `scrollToIndex` de FlashList con `animated: true` para transición suave al expandir.

- **Precarga de valores puede ser lenta si la query SQLite tarda**: `getLastWorkoutExerciseData` es una query simple con índice en `exercise_id`. → Mitigación: ejecutar la precarga en el store al iniciar el workout, no en cada render del SetRow. La pantalla solo lee del store.

- **Un solo ejercicio expandido limita multitasking**: El usuario no puede ver dos ejercicios a la vez. → Trade-off aceptado: simplifica el estado y mejora el enfoque en el ejercicio actual. Patrón común en apps de workout (Strong, Hevy).

- **Sin cola offline en MVP**: Si SQLite falla durante un set, el set se pierde. → Mitigación: el WorkoutRepo ya envuelve en try/catch y lanza `DatabaseError`. En el store, reintentar hasta 3 veces. La cola MMKV es una mejora futura documentada en architecture.md.
