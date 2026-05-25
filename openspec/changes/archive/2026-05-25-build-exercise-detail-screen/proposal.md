## Why

Los usuarios necesitan consultar el historial y rendimiento detallado de un ejercicio específico desde la biblioteca. Sin una pantalla de detalle, no pueden ver sus métricas de progreso (máximo peso, 1RM estimado, volumen), gráficas de evolución, PRs históricos ni el historial reciente de uso del ejercicio. Esta pantalla es P1 esencial para completar el loop de progreso.

## What Changes

- Nueva ruta `app/exercise/[id].tsx` con layout de detalle de ejercicio
- Header con nombre del ejercicio, badges de músculos coloreados (desde `muscleColors`), categoría y equipo
- Tarjeta "Best Performance" con máximo peso levantado, mejor 1RM estimado y máximo volumen por sesión (datos reales desde SQLite)
- Sección "Recent History" con últimos 5 usos del ejercicio (sesión, fecha, sets, volumen)
- Gráfica de progreso con VictoryLine mostrando evolución de volumen/1RM en últimas 10 sesiones
- Lista completa de PRs del ejercicio (todos los tipos: max_weight, max_volume, max_reps, estimated_1rm, max_session_volume)
- Botones de acción: Edit y Delete visibles solo para ejercicios personalizados (`is_custom === 1`), Start Quick Workout (crea sesión activa con este ejercicio)
- Todos los datos se cargan desde repositorios existentes (ExerciseRepo, WorkoutRepo) con cálculos delegados a domain/services
- Pantalla thin: lógica de datos en repos y cálculos en funciones puras de domain

## Capabilities

### New Capabilities
- `exercise-detail-screen`: Pantalla de detalle de ejercicio con header + muscle badges, Best Performance card (max weight/1RM/volume), historial reciente (últimos 5 usos), gráfica de progreso (VictoryLine, últimas 10 sesiones), lista de PRs, y acciones Edit/Delete (solo custom) + Start Quick Workout.

### Modified Capabilities
<!-- No se modifican specs existentes. La pantalla consume ExerciseRepo, WorkoutRepo, domain/calculations y domain/services sin cambiar su contrato. -->

## Impact

- Nuevo archivo: `src/app/exercise/[id].tsx`
- Componentes nuevos: `src/components/ui/MuscleBadge.tsx`, `src/components/exercise/BestPerformanceCard.tsx`, `src/components/exercise/RecentHistoryList.tsx`, `src/components/exercise/ExercisePRList.tsx`, `src/components/charts/ProgressChart.tsx`
- Servicio nuevo: `src/domain/services/exerciseStats.ts` — agrega métricas por ejercicio (best weight, best 1RM, best volume, session history)
- Depende de: `ExerciseRepo` (getById, getMuscles, update, delete), `WorkoutRepo` (getPreviousPerformance, getPRsByExercise, createSession, addExercise), `estimate1RM` (domain/calculations), `calculateExerciseVolume` (domain/calculations)
- No afecta rutas, repositorios ni entidades existentes
- Añade ruta dinámica `exercise/[id]` navegable desde la biblioteca de ejercicios
