## Context

La pantalla de detalle de ejercicio es P1 del MVP. Muestra métricas de rendimiento, historial reciente, gráfica de progreso y PRs para un ejercicio específico. Consume datos de ExerciseRepo y WorkoutRepo, delegando cálculos a funciones puras en `domain/services/exerciseStats.ts`. Usa VictoryLine de VictoryNative para la gráfica y muscleColors del theme para los badges de músculo.

Design reference compliance: implementation MUST review `DESIGN.md` and the relevant `tmp/design/screens/exercise_progress-html.html` reference before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Pantalla funcional con header + muscle badges, Best Performance card, Recent History, Progress Chart y PRs list
- Datos reales desde SQLite vía repos existentes
- Gráfica VictoryLine con datos de últimas 10 sesiones
- Edit/Delete visibles solo para ejercicios custom (`is_custom === 1`)
- Start Quick Workout: crea sesión activa con este ejercicio y navega al workout
- Pantalla thin: lógica de agregación en `domain/services/exerciseStats.ts`, cálculos en `domain/calculations/`
- Muscle badges con colores correctos desde `src/theme/muscleColors.ts`
- ScrollView con secciones, sin FlashList (datos acotados: 5 historial, 10 puntos de gráfica)

**Non-Goals:**
- Editar músculos del ejercicio desde esta pantalla (va en exercise form)
- Comparación contra sesión anterior (va en workout summary)
- Exportar datos del ejercicio
- Animaciones complejas en la gráfica
- Swipe actions en el historial

## Decisions

1. **Arquitectura de datos**: La pantalla carga el ejercicio con `ExerciseRepo.getById()` y sus músculos con `ExerciseRepo.getMuscles()`. Los datos de rendimiento se obtienen vía `WorkoutRepo.getPreviousPerformance()` (últimos N sets) y `WorkoutRepo.getPRsByExercise()`. Un nuevo servicio `exerciseStats.ts` agrega Best Performance (max weight, best 1RM, max volume) combinando queries de set_logs.

2. **Nuevo servicio domain: exerciseStats.ts**: Agrega métricas específicas por ejercicio. Expone funciones como `getBestWeight()`, `getBestEstimated1RM()`, `getBestVolume()`, `getSessionHistory()`. Todas son funciones puras que reciben arrays de SetLog[] o datos planos y retornan valores calculados. Esto mantiene la pantalla thin y los cálculos testeables.

3. **Gráfica de progreso**: Se usa VictoryChart + VictoryLine + VictoryAxis de VictoryNative. Datos: últimas 10 sesiones con volumen total por sesión y 1RM estimado (dos líneas o una línea con tooltip). La data se prepara en `exerciseStats.getProgressData()` que toma los sets agrupados por sesión. VictoryNative ya está en el stack del proyecto.

4. **Best Performance Card**: Muestra 3 métricas en una card horizontal: Max Weight (máximo peso levantado), Best 1RM (mejor estimación Epley), Best Volume (máximo volumen por sesión). Cada una con label, valor y unidad. Los datos vienen de `exerciseStats.getBestMetrics()`.

5. **Recent History**: Lista de últimos 5 usos del ejercicio. Cada ítem muestra: nombre/fecha de la sesión, número de sets completados, volumen total. Datos desde `WorkoutRepo.getPreviousPerformance()` agrupados por sesión en `exerciseStats.getRecentHistory()`.

6. **PRs list**: FlatList o mapeo de todos los PRs del ejercicio desde `WorkoutRepo.getPRsByExercise()`. Agrupados por tipo (max_weight, max_volume, estimated_1rm, etc.) con badge de tipo y valor + fecha.

7. **Edit/Delete condicional**: Se verifica `exercise.is_custom === 1`. Si es true, se muestran botones de Edit (navega a form de edición, ruta futura `exercise/edit/[id]`) y Delete (confirma y llama `ExerciseRepo.delete()`). Si es false (ejercicio seed), los botones se ocultan.

8. **Quick Workout**: Botón "Iniciar entrenamiento rápido" que crea una `WorkoutSession` con status `active` vía `WorkoutRepo.createSession()`, añade este ejercicio vía `WorkoutRepo.addExercise()`, y navega a la pantalla de active workout. Si ya hay una sesión activa, pregunta si quiere añadir el ejercicio a la sesión existente o iniciar una nueva.

9. **Estructura de componentes**: `MuscleBadge.tsx` (pill coloreado con nombre del músculo), `BestPerformanceCard.tsx` (card con 3 métricas), `RecentHistoryList.tsx` (lista de últimos usos), `ExercisePRList.tsx` (lista de PRs agrupados), `ProgressChart.tsx` (VictoryChart wrapper).

10. **Manejo de carga y errores**: La pantalla usa un estado de loading mientras carga datos de ExerciseRepo y WorkoutRepo. Si el ejercicio no existe (getById retorna null), muestra un estado de error con opción de volver. Errores de SQLite se capturan en try/catch y se muestra un mensaje genérico.

## Risks / Trade-offs

- **Best Performance requiere queries adicionales**: Para max weight, best 1RM y best volume se necesitan consultas a set_logs. → Mitigación: una sola query que obtenga todos los sets del ejercicio y procesar en memoria con domain/calculations. Con WAL mode y <1000 sets por ejercicio, el rendimiento es aceptable.
- **VictoryNative en Android puede tener issues de rendering inicial**: → Mitigación: wrapper ProgressChart con fallback de tabla de datos si la gráfica falla. Testear en Android físico.
- **Quick Workout con sesión activa existente**: Puede haber conflicto si el usuario ya tiene un workout en progreso. → Mitigación: detectar sesión activa con `WorkoutRepo.getActiveSession()` y mostrar diálogo de confirmación antes de crear nueva.
- **Delete de ejercicio custom con historial**: Borrar un ejercicio custom elimina sus exercise_muscles (CASCADE) pero NO sus set_logs históricos (están ligados a workout_exercises, no a exercises directamente). → Mitigación: documentar que borrar un ejercicio custom no elimina el historial de sesiones pasadas donde se usó. Los sets se preservan vía workout_exercises.exercise_id.
- **Pantalla larga con ScrollView**: 5 secciones (header, best performance, history, chart, PRs) pueden causar scroll extenso. → Mitigación: usar `SectionList` o ScrollView con `removeClippedSubviews`. Si es muy largo, colapsar secciones con animaciones (P2).
